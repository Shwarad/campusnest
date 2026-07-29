/**
 * ai.routes.ts
 *
 * All AI-related API endpoints.
 *
 * POST /api/ai/search/parse
 * POST /api/ai/properties/compare
 * GET  /api/ai/properties/:propertyId/summary
 * GET  /api/ai/properties/:propertyId/reviews/summary
 * GET  /api/ai/properties/:propertyId/risk-explanation
 * GET  /api/ai/roommates/:roommateId/explanation
 * POST /api/ai/chat
 * GET  /api/ai/status
 */

import { Router, Response } from 'express';
import { z } from 'zod';
import { rateLimit } from 'express-rate-limit';
import { authenticate, optionalAuth } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { isAiEnabled } from './graniteClient';
import { MOCK_MODE } from './mockMode';

import { parseNaturalSearchQuery, filtersToQueryParams } from './naturalSearch.service';
import { compareProperties } from './propertyComparison.service';
import { getListingSummary } from './listingSummary.service';
import { getRoommateExplanation } from './roommateExplanation.service';
import { getReviewSummary } from './reviewSummary.service';
import { getScamRiskExplanation } from './scamExplanation.service';
import { chat } from './chat.service';
const generateId = (): string => Math.random().toString(36).slice(2) + Date.now().toString(36);

const router = Router();

// AI-specific rate limit (tighter than global)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max:      20,
  message:  { message: 'Too many AI requests. Please slow down.' },
});

router.use(aiLimiter);

// ── GET /api/ai/status ────────────────────────────────────────────────────────

router.get('/status', (_req, res: Response) => {
  res.json({
    enabled:    isAiEnabled() || MOCK_MODE,
    mockMode:   MOCK_MODE,
    modelId:    process.env.IBM_GRANITE_MODEL_ID ?? 'not configured',
  });
});

// ── POST /api/ai/search/parse ─────────────────────────────────────────────────

const parseSearchSchema = z.object({
  query: z.string().min(3).max(500),
});

router.post('/search/parse', async (req, res: Response) => {
  const result = parseSearchSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: 'query is required (3-500 chars).' });
    return;
  }

  try {
    const parsed      = await parseNaturalSearchQuery(result.data.query);
    const queryParams = filtersToQueryParams(parsed.filters);
    res.json({
      filters:        parsed.filters,
      interpretation: parsed.interpretation,
      queryParams,
      aiAssisted:     parsed.aiAssisted,
    });
  } catch (err) {
    console.error('[ai.routes] /search/parse error:', (err as Error).message);
    res.status(500).json({ message: 'Search parsing failed. Using standard search.' });
  }
});

// ── POST /api/ai/properties/compare ──────────────────────────────────────────

const compareSchema = z.object({
  propertyIds: z.array(z.string()).min(2).max(3),
  preferences: z.object({
    college:             z.string().optional(),
    maximumRent:         z.number().optional(),
    importantAmenities:  z.array(z.string()).optional(),
    priority:            z.enum(['distance', 'rent', 'rating', 'amenities', 'verification']).optional(),
  }).optional(),
});

router.post('/properties/compare', async (req, res: Response) => {
  const result = compareSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: 'Provide 2-3 valid property IDs.' });
    return;
  }

  try {
    const { propertyIds, preferences = {} } = result.data;
    const data = await compareProperties(propertyIds, preferences);
    res.json(data);
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes('not found') || msg.includes('2 or 3')) {
      res.status(400).json({ message: msg });
    } else {
      console.error('[ai.routes] /properties/compare error:', msg);
      res.status(500).json({ message: 'Comparison failed. Please try again.' });
    }
  }
});

// ── GET /api/ai/properties/:propertyId/summary ────────────────────────────────

router.get('/properties/:propertyId/summary', async (req, res: Response) => {
  try {
    const summary = await getListingSummary(req.params.propertyId);
    res.json({ summary, disclaimer: 'AI-generated summary based on information supplied by the property owner.' });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes('not found')) res.status(404).json({ message: msg });
    else { console.error('[ai.routes] /summary error:', msg); res.status(500).json({ message: 'Summary generation failed.' }); }
  }
});

// ── GET /api/ai/properties/:propertyId/reviews/summary ───────────────────────

router.get('/properties/:propertyId/reviews/summary', async (req, res: Response) => {
  try {
    const summary = await getReviewSummary(req.params.propertyId);
    if (!summary) {
      res.status(200).json({ summary: null, message: 'At least 3 reviews are needed to generate a summary.' });
    } else {
      res.json({ summary });
    }
  } catch (err) {
    console.error('[ai.routes] /reviews/summary error:', (err as Error).message);
    res.status(500).json({ message: 'Review summary generation failed.' });
  }
});

// ── GET /api/ai/properties/:propertyId/risk-explanation ──────────────────────

router.get('/properties/:propertyId/risk-explanation', async (req, res: Response) => {
  try {
    const explanation = await getScamRiskExplanation(req.params.propertyId);
    res.json({ explanation });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes('not found')) res.status(404).json({ message: msg });
    else { console.error('[ai.routes] /risk-explanation error:', msg); res.status(500).json({ message: 'Risk explanation failed.' }); }
  }
});

// ── GET /api/ai/roommates/:roommateId/explanation ─────────────────────────────

router.get('/roommates/:roommateId/explanation', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const explanation = await getRoommateExplanation(req.user!.id, req.params.roommateId);
    res.json({ explanation });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes('not found') || msg.includes('profile')) {
      res.status(404).json({ message: msg });
    } else {
      console.error('[ai.routes] /roommates/explanation error:', msg);
      res.status(500).json({ message: 'Roommate explanation failed.' });
    }
  }
});

// ── POST /api/ai/chat ─────────────────────────────────────────────────────────

const chatSchema = z.object({
  message:        z.string().min(1).max(1000),
  conversationId: z.string().optional(),
  context: z.object({
    selectedPropertyIds: z.array(z.string()).max(3).optional(),
  }).optional(),
});

router.post('/chat', optionalAuth, async (req: AuthRequest, res: Response) => {
  const result = chatSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: 'message is required.' });
    return;
  }

  const { message, conversationId, context = {} } = result.data;

  try {
    const output = await chat({
      message,
      conversationId: conversationId ?? generateId(),
      userId:         req.user?.id,
      context,
    });
    res.json(output);
  } catch (err) {
    console.error('[ai.routes] /chat error:', (err as Error).message);
    res.status(500).json({ message: 'Chat service unavailable. Please try again.' });
  }
});

export default router;
