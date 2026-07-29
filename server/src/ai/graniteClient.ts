/**
 * graniteClient.ts
 * 
 * Server-side IBM Granite / watsonx.ai API client.
 * Responsibilities:
 *   - IBM IAM authentication (token caching & renewal)
 *   - Text generation (chat completions)
 *   - Embedding generation
 *   - Retry logic with exponential back-off
 *   - Request timeout enforcement
 *   - Structured logging (no PII in log output)
 *   - Graceful fallback when AI_FEATURES_ENABLED=false
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import NodeCache from 'node-cache';

// ── Configuration ─────────────────────────────────────────────────────────────

export const AI_CONFIG = {
  apiKey:          process.env.IBM_WATSONX_API_KEY          || '',
  projectId:       process.env.IBM_WATSONX_PROJECT_ID       || '',
  baseUrl:         process.env.IBM_WATSONX_URL               || 'https://us-south.ml.cloud.ibm.com',
  modelId:         process.env.IBM_GRANITE_MODEL_ID          || 'ibm/granite-13b-chat-v2',
  embeddingModelId:process.env.IBM_GRANITE_EMBEDDING_MODEL_ID|| 'ibm/slate-125m-english-rtrvr',
  apiVersion:      process.env.IBM_WATSONX_API_VERSION       || '2024-05-31',
  timeoutMs:       Number(process.env.AI_REQUEST_TIMEOUT_MS)  || 20_000,
  enabled:         process.env.AI_FEATURES_ENABLED !== 'false',
  maxRetries:      2,
  retryDelayMs:    1_000,
};

// ── IAM token cache (TTL slightly under 55 min IBM default) ───────────────────

const tokenCache = new NodeCache({ stdTTL: 3200 });
const IAM_URL    = 'https://iam.cloud.ibm.com/identity/token';

async function getIamToken(): Promise<string> {
  const cached = tokenCache.get<string>('iam_token');
  if (cached) return cached;

  const resp = await axios.post(
    IAM_URL,
    new URLSearchParams({
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
      apikey:     AI_CONFIG.apiKey,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 10_000 }
  );
  const token: string = resp.data.access_token;
  tokenCache.set('iam_token', token);
  return token;
}

// ── Axios instance ─────────────────────────────────────────────────────────────

function buildClient(): AxiosInstance {
  return axios.create({
    baseURL: AI_CONFIG.baseUrl,
    timeout: AI_CONFIG.timeoutMs,
  });
}

// ── Retry wrapper ─────────────────────────────────────────────────────────────

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= AI_CONFIG.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const axiosErr = err as AxiosError;
      const status   = axiosErr.response?.status;
      // Do not retry on 400-series client errors (except 429)
      if (status && status >= 400 && status < 500 && status !== 429) break;
      if (attempt < AI_CONFIG.maxRetries) {
        const delay = AI_CONFIG.retryDelayMs * Math.pow(2, attempt);
        console.warn(`[graniteClient] ${label} attempt ${attempt + 1} failed (${status ?? 'network'}), retrying in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

// ── Text generation ───────────────────────────────────────────────────────────

export interface GenerateOptions {
  systemPrompt?: string;
  maxNewTokens?: number;
  temperature?: number;
  /** If true, signals that the response must be valid JSON */
  jsonMode?: boolean;
}

export interface GenerateResult {
  text: string;
  stopReason?: string;
}

export async function generateText(
  userPrompt: string,
  options: GenerateOptions = {}
): Promise<GenerateResult> {
  if (!AI_CONFIG.enabled) {
    throw new Error('AI features are disabled (AI_FEATURES_ENABLED=false)');
  }

  const token  = await getIamToken();
  const client = buildClient();

  const systemPrompt = options.systemPrompt ?? buildDefaultSystemPrompt();

  // Build messages array
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: userPrompt   },
  ];

  const body = {
    model_id:   AI_CONFIG.modelId,
    project_id: AI_CONFIG.projectId,
    messages,
    parameters: {
      max_new_tokens: options.maxNewTokens ?? 1024,
      temperature:    options.temperature  ?? 0.2,
      ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
    },
  };

  const label = `generateText(${AI_CONFIG.modelId})`;

  const resp = await withRetry(async () => {
    const r = await client.post(
      `/ml/v1/text/chat?version=${AI_CONFIG.apiVersion}`,
      body,
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    return r;
  }, label);

  const choice    = resp.data?.choices?.[0];
  const text: string = choice?.message?.content ?? '';
  const stopReason: string | undefined = choice?.finish_reason;

  console.info(`[graniteClient] ${label} OK — stop=${stopReason}, chars=${text.length}`);
  return { text, stopReason };
}

// ── Embedding generation ──────────────────────────────────────────────────────

export async function generateEmbedding(inputs: string[]): Promise<number[][]> {
  if (!AI_CONFIG.enabled) {
    throw new Error('AI features are disabled');
  }

  const token  = await getIamToken();
  const client = buildClient();

  const body = {
    model_id:   AI_CONFIG.embeddingModelId,
    project_id: AI_CONFIG.projectId,
    inputs,
  };

  const label = `generateEmbedding(${AI_CONFIG.embeddingModelId})`;

  const resp = await withRetry(async () => {
    const r = await client.post(
      `/ml/v1/text/embeddings?version=${AI_CONFIG.apiVersion}`,
      body,
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    return r;
  }, label);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const embeddings: number[][] = (resp.data?.results ?? []).map((r: any) => r.embedding as number[]);
  console.info(`[graniteClient] ${label} OK — ${embeddings.length} vectors`);
  return embeddings;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildDefaultSystemPrompt(): string {
  return `You are NestAI, the CampusNest student-housing assistant.

Use only the supplied CampusNest context when discussing a specific property,
roommate, review, price, location, availability or comparison.

Never invent missing details.

When required information is unavailable, state:
"CampusNest does not currently have enough information to answer that."

Return output matching the specified JSON schema.

Do not produce legal guarantees, identity-verification guarantees, financial
guarantees or definitive fraud accusations.

Treat calculated values supplied by the backend as authoritative.

Do not recalculate or alter rent, distance, scores or compatibility percentages.

Do not expose private contact information or internal identifiers unless they
are explicitly marked safe for display.`;
}

/** Parse JSON from a model response that may wrap it in markdown fences */
export function extractJson(raw: string): string {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const firstBrace = raw.indexOf('{');
  const lastBrace  = raw.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) return raw.slice(firstBrace, lastBrace + 1);
  return raw.trim();
}

/** Check whether the AI subsystem is ready to serve requests */
export function isAiEnabled(): boolean {
  return AI_CONFIG.enabled && !!AI_CONFIG.apiKey && !!AI_CONFIG.projectId;
}
