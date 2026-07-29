/**
 * chat.service.ts
 *
 * NestAI Housing Assistant chat service.
 *
 * Handles multi-turn conversation with context injection.
 * Fetches all necessary data server-side before calling Granite.
 * Never trusts property values supplied by the client.
 */

import NodeCache from 'node-cache';
import { prisma } from '../config/database';
import { generateText, extractJson } from './graniteClient';
import { chatSystemPrompt, chatUserPrompt } from './promptTemplates';
import { ChatResponseSchema, ChatResponse } from './responseSchemas';
import { MOCK_MODE, mockChatResponse } from './mockMode';

// Conversation history cache (15 min TTL)
interface ConversationTurn {
  role:    'user' | 'assistant';
  content: string;
}

const conversationCache = new NodeCache({ stdTTL: 900 });

function getHistory(id: string): ConversationTurn[] {
  return conversationCache.get<ConversationTurn[]>(id) ?? [];
}

function setHistory(id: string, history: ConversationTurn[]): void {
  // Keep at most 10 turns to stay within context window
  conversationCache.set(id, history.slice(-10));
}

export interface ChatInput {
  message:        string;
  conversationId: string;
  userId?:        string;
  context: {
    selectedPropertyIds?: string[];
  };
}

export interface ChatOutput {
  reply:             string;
  propertyRefs:      string[];
  suggestedActions:  string[];
  conversationId:    string;
}

// ── Fetch grounding context ───────────────────────────────────────────────────

async function buildContext(input: ChatInput): Promise<string> {
  const contextParts: Record<string, unknown> = {};

  // Fetch selected properties (server-side only, strip PII)
  const selectedIds = (input.context.selectedPropertyIds ?? []).slice(0, 3);
  if (selectedIds.length > 0) {
    const props = await prisma.property.findMany({
      where: { id: { in: selectedIds }, isActive: true },
    });

    contextParts.selectedProperties = props.map((p) => ({
      id:                  p.id,
      title:               p.title,
      locality:            p.locality,
      college:             p.college,
      distanceFromCollege: p.distanceFromCollege,
      rent:                p.rent,
      deposit:             p.deposit,
      propertyType:        p.propertyType,
      furnishing:          p.furnishing,
      genderPreference:    p.genderPreference,
      verificationStatus:  p.verificationStatus,
      isAvailable:         p.isAvailable,
      avgRating:           p.avgRating,
      scamRiskLevel:       p.scamRiskLevel,
      amenities: {
        wifi:             p.wifi,
        food:             p.food,
        ac:               p.ac,
        attachedBathroom: p.attachedBathroom,
        parking:          p.parking,
        laundry:          p.laundry,
      },
      // No contactPhone, contactEmail, ownerId
    }));
  }

  // Fetch user's saved properties if logged in
  if (input.userId) {
    const saved = await prisma.savedProperty.findMany({
      where: { userId: input.userId },
      include: {
        property: {
          select: {
            id: true, title: true, locality: true, college: true,
            distanceFromCollege: true, rent: true, verificationStatus: true,
            avgRating: true, scamRiskLevel: true,
          },
        },
      },
      take: 10,
    });

    contextParts.savedProperties = saved.map((s) => ({
      id:                  s.property.id,
      title:               s.property.title,
      locality:            s.property.locality,
      college:             s.property.college,
      distanceFromCollege: s.property.distanceFromCollege,
      rent:                s.property.rent,
      verificationStatus:  s.property.verificationStatus,
      avgRating:           s.property.avgRating,
      scamRiskLevel:       s.property.scamRiskLevel,
    }));

    // Fetch roommate profile
    const roommateProfile = await prisma.roommateProfile.findUnique({
      where: { userId: input.userId },
      select: {
        college: true, budgetMin: true, budgetMax: true,
        preferredLocality: true, roomType: true,
      },
    });
    if (roommateProfile) contextParts.myRoommatePreferences = roommateProfile;
  }

  return JSON.stringify(contextParts, null, 2);
}

// ── Main entry point ──────────────────────────────────────────────────────────

export async function chat(input: ChatInput): Promise<ChatOutput> {
  // Sanitise message
  const safeMessage = input.message.slice(0, 1000);

  if (MOCK_MODE) {
    const mock = mockChatResponse(safeMessage);
    return { ...mock, conversationId: input.conversationId };
  }

  const history     = getHistory(input.conversationId);
  const contextJson = await buildContext(input);
  const systemPmt   = chatSystemPrompt();

  let response: ChatResponse;

  try {
    const userContent = chatUserPrompt(safeMessage, contextJson);

    // Build full messages array with conversation history
    const historyMessages = history.map((t) => ({
      role:    t.role,
      content: t.content,
    }));

    // We pass the full conversation via the user prompt with context.
    // The generateText function builds: [system, user]. For multi-turn we
    // inject the prior turns into the user prompt for simplicity.
    const fullPrompt = historyMessages.length > 0
      ? `Previous conversation:\n${historyMessages.map((t) => `${t.role}: ${t.content}`).join('\n')}\n\n${userContent}`
      : userContent;

    const result = await generateText(fullPrompt, {
      systemPrompt: systemPmt,
      maxNewTokens: 512,
      temperature:  0.4,
      jsonMode:     true,
    });

    const rawJson = extractJson(result.text);
    const parsed  = JSON.parse(rawJson);

    const validated = ChatResponseSchema.safeParse(parsed);
    if (!validated.success) {
      console.warn('[chat] Zod validation failed:', validated.error.flatten());
      response = buildFallbackChatResponse(safeMessage);
    } else {
      response = validated.data;
    }
  } catch (err) {
    console.error('[chat] AI failed:', (err as Error).message);
    response = buildFallbackChatResponse(safeMessage);
  }

  // Update conversation history
  history.push({ role: 'user',      content: safeMessage          });
  history.push({ role: 'assistant', content: response.reply       });
  setHistory(input.conversationId, history);

  return {
    ...response,
    conversationId: input.conversationId,
  };
}

function buildFallbackChatResponse(message: string): ChatResponse {
  return {
    reply: `I'm NestAI, your CampusNest housing assistant. I was unable to process your request right now. You can search for properties, compare listings, or browse roommate profiles directly. Message: "${message.slice(0, 80)}"`,
    propertyRefs:     [],
    suggestedActions: ['Search for properties', 'View saved listings', 'Find a roommate'],
  };
}
