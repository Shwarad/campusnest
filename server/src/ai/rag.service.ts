/**
 * rag.service.ts
 *
 * Retrieval-Augmented Generation service.
 *
 * Phase AI-3 (basic in-memory vector store for Phase AI-1/AI-2).
 * In production, swap the in-memory store for pgvector, Milvus or Chroma.
 *
 * Semantic search flow:
 *   User Query → Granite Embedding → Vector Similarity → Top Listings
 *   → Optional Reranking → Granite Grounded Response
 *
 * Final score formula (backend, not AI):
 *   0.40 × semantic similarity
 *   0.20 × budget match
 *   0.15 × distance match
 *   0.10 × amenity match
 *   0.10 × rating score
 *   0.05 × verification score
 */

import { generateEmbedding, isAiEnabled } from './graniteClient';
import { prisma } from '../config/database';

interface EmbeddingRecord {
  propertyId: string;
  vector:     number[];
  updatedAt:  Date;
}

// In-memory store — replace with pgvector in production
const embeddingStore: Map<string, EmbeddingRecord> = new Map();

// ── Cosine similarity ─────────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

// ── Build text to embed for a property ───────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildPropertyText(p: any): string {
  const amenities = [
    p.wifi && 'Wi-Fi', p.food && 'food included', p.ac && 'air conditioning',
    p.attachedBathroom && 'attached bathroom', p.laundry && 'laundry',
    p.powerBackup && 'power backup', p.parking && 'parking',
  ].filter(Boolean).join(', ');

  return [
    p.title,
    p.description,
    p.locality,
    p.city,
    p.college,
    p.propertyType,
    p.furnishing,
    amenities,
    ...(Array.isArray(p.houseRules) ? p.houseRules : []),
  ].filter(Boolean).join(' ');
}

// ── Index a property ──────────────────────────────────────────────────────────

export async function indexProperty(propertyId: string): Promise<void> {
  if (!isAiEnabled()) return;

  const raw = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!raw || !raw.isActive) return;

  try {
    const text   = buildPropertyText(raw);
    const [vec]  = await generateEmbedding([text]);
    embeddingStore.set(propertyId, { propertyId, vector: vec, updatedAt: new Date() });
    console.info(`[rag] Indexed property ${propertyId}`);
  } catch (err) {
    console.warn(`[rag] Failed to index property ${propertyId}:`, (err as Error).message);
  }
}

// ── Semantic search ───────────────────────────────────────────────────────────

interface SemanticSearchOptions {
  maximumRent?:       number;
  college?:           string;
  maxDistanceKm?:     number;
  amenities?:         string[];
  topK?:              number;
}

export interface SemanticSearchResult {
  propertyId:   string;
  finalScore:   number;
  semanticSim:  number;
}

export async function semanticSearch(
  query: string,
  options: SemanticSearchOptions = {}
): Promise<SemanticSearchResult[]> {
  if (!isAiEnabled() || embeddingStore.size === 0) return [];

  // Generate query embedding
  const [queryVec] = await generateEmbedding([query]);

  // Fetch all candidate properties
  const where: Record<string, unknown> = { isActive: true, isAvailable: true };
  if (options.maximumRent) where.rent = { lte: options.maximumRent };
  if (options.college)     where.college = { contains: options.college };
  if (options.maxDistanceKm) where.distanceFromCollege = { lte: options.maxDistanceKm };

  const properties = await prisma.property.findMany({ where: where as never, take: 100 });

  // Score each property
  const results: SemanticSearchResult[] = [];

  for (const p of properties) {
    const record = embeddingStore.get(p.id);
    if (!record) continue;

    const semanticSim = cosineSimilarity(queryVec, record.vector);

    // Budget match (1 = within budget, 0 = exceeds)
    const budgetMatch = options.maximumRent && options.maximumRent > 0
      ? p.rent <= options.maximumRent ? 1 : 0
      : 0.5;

    // Distance match (normalised to 0-1, 0 km = 1, 10+ km = 0)
    const distanceMatch = Math.max(0, 1 - p.distanceFromCollege / 10);

    // Amenity match
    const amenityMap: Record<string, boolean> = {
      wifi: p.wifi, ac: p.ac, attachedBathroom: p.attachedBathroom,
      parking: p.parking, laundry: p.laundry, food: p.food,
    };
    const wantedAmenities = options.amenities ?? [];
    const amenityMatch = wantedAmenities.length > 0
      ? wantedAmenities.filter((a) => amenityMap[a]).length / wantedAmenities.length
      : 0.5;

    // Rating score (normalised 0-1)
    const ratingScore = p.avgRating > 0 ? p.avgRating / 5 : 0.5;

    // Verification score
    const verificationScore = p.verificationStatus === 'verified' ? 1 : 0.3;

    // Final composite score
    const finalScore =
      0.40 * semanticSim  +
      0.20 * budgetMatch  +
      0.15 * distanceMatch +
      0.10 * amenityMatch  +
      0.10 * ratingScore   +
      0.05 * verificationScore;

    results.push({ propertyId: p.id, finalScore, semanticSim });
  }

  return results
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, options.topK ?? 10);
}

// ── Bulk reindex (call on startup or when properties change) ──────────────────

export async function reindexAll(): Promise<void> {
  if (!isAiEnabled()) return;
  const properties = await prisma.property.findMany({ where: { isActive: true }, select: { id: true } });
  console.info(`[rag] Starting bulk reindex of ${properties.length} properties...`);
  // Index in batches of 10 to avoid rate limits
  for (let i = 0; i < properties.length; i += 10) {
    const batch = properties.slice(i, i + 10);
    await Promise.allSettled(batch.map((p) => indexProperty(p.id)));
  }
  console.info('[rag] Reindex complete.');
}
