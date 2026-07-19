import { env } from '@/config/env.js';
import { AppError } from '@/utils/app-error.js';
import { logger } from '@/utils/logger.js';

export interface AIProviderRequest {
  systemPrompt: string;
  userPrompt: string;
  responseFormatName: string;
}

export interface AIProviderImage {
  mimeType: string;
  base64: string;
}

export interface AIProviderResponse {
  provider: string;
  model: string;
  content: string;
  durationMs: number;
}

export interface AIProvider {
  readonly provider: string;
  readonly model: string;
  generateJson(request: AIProviderRequest): Promise<AIProviderResponse>;
  generateJsonWithImages(request: AIProviderRequest & { images: AIProviderImage[] }): Promise<AIProviderResponse>;
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> }; finishReason?: string }>;
}

class GeminiProvider implements AIProvider {
  readonly provider = 'gemini';
  readonly model = env.geminiModel;

  generateJson(request: AIProviderRequest): Promise<AIProviderResponse> {
    return this.generate(request, []);
  }

  generateJsonWithImages(request: AIProviderRequest & { images: AIProviderImage[] }): Promise<AIProviderResponse> {
    return this.generate(request, request.images);
  }

  private async generate(request: AIProviderRequest, images: AIProviderImage[]): Promise<AIProviderResponse> {
    if (!env.geminiApiKey) {
      throw new AppError('AI provider is not configured. Set GEMINI_API_KEY on the backend.', 503);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.aiRequestTimeoutMs);
    const startedAt = Date.now();

    try {
      const model = encodeURIComponent(this.model);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'x-goog-api-key': env.geminiApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: request.systemPrompt }] },
          contents: [{
            role: 'user',
            parts: [
              { text: request.userPrompt },
              ...images.map((image) => ({ inlineData: { mimeType: image.mimeType, data: image.base64 } })),
            ],
          }],
          generationConfig: {
            temperature: images.length > 0 ? 0.1 : 0.2,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
            responseJsonSchema: responseJsonSchemas[request.responseFormatName],
          },
        }),
      });

      if (!response.ok) await throwProviderError(response, images.length > 0 ? 'image' : 'text');

      const payload = (await response.json()) as GeminiResponse;
      const content = payload.candidates?.[0]?.content?.parts
        ?.filter((part) => part.thought !== true)
        .map((part) => part.text ?? '')
        .join('')
        .trim();
      if (!content || content.length > 60_000) {
        logger.error('AI provider returned unusable content', {
          provider: this.provider,
          model: this.model,
          finishReason: payload.candidates?.[0]?.finishReason,
          contentLength: content?.length ?? 0,
        });
        throw new AppError('AI provider returned an empty or oversized response.', 502);
      }

      return { provider: this.provider, model: this.model, content, durationMs: Date.now() - startedAt };
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AppError('AI provider request timed out. Please try again.', 504);
      }
      throw new AppError('AI provider is unavailable. Please try again later.', 503);
    } finally {
      clearTimeout(timeout);
    }
  }
}

const scoreSchema = { type: 'number' } as const;
const textSchema = { type: 'string' } as const;
const textListSchema = { type: 'array', items: textSchema } as const;

const responseJsonSchemas: Record<string, unknown> = {
  'land-analysis': {
    type: 'object',
    required: [
      'landHealthScore', 'soilSuitability', 'waterAssessment', 'climateSuitability',
      'landStrengths', 'landLimitations', 'riskScore', 'riskLevel',
      'preparationSteps', 'suitableCategories', 'explanation',
    ],
    properties: {
      landHealthScore: scoreSchema,
      soilSuitability: {
        type: 'object',
        required: ['score', 'summary', 'recommendedImprovements'],
        properties: { score: scoreSchema, summary: textSchema, recommendedImprovements: textListSchema },
      },
      waterAssessment: {
        type: 'object',
        required: ['score', 'summary', 'limitations'],
        properties: { score: scoreSchema, summary: textSchema, limitations: textListSchema },
      },
      climateSuitability: {
        type: 'object',
        required: ['score', 'summary'],
        properties: { score: scoreSchema, summary: textSchema },
      },
      landStrengths: textListSchema,
      landLimitations: textListSchema,
      riskScore: scoreSchema,
      riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
      preparationSteps: textListSchema,
      suitableCategories: textListSchema,
      explanation: textSchema,
    },
  },
};

export function getAIProvider(): AIProvider {
  return new GeminiProvider();
}

async function throwProviderError(response: Response, requestType: 'text' | 'image'): Promise<never> {
  let providerCode: string | number | undefined;
  let providerStatus: string | undefined;

  try {
    const payload = (await response.json()) as { error?: { code?: unknown; status?: unknown } };
    providerCode = typeof payload.error?.code === 'string' || typeof payload.error?.code === 'number'
      ? payload.error.code
      : undefined;
    providerStatus = typeof payload.error?.status === 'string' ? payload.error.status : undefined;
  } catch {
    // An upstream proxy may return a non-JSON error page.
  }

  logger.error('AI provider rejected request', {
    provider: 'gemini',
    requestType,
    status: response.status,
    providerCode,
    providerStatus,
    providerRequestId: response.headers.get('x-request-id') ?? undefined,
  });

  if (response.status === 400) throw new AppError('Gemini rejected the AI request configuration.', 502);
  if (response.status === 401 || response.status === 403) {
    throw new AppError('Gemini authentication failed. Check GEMINI_API_KEY and its restrictions.', 503);
  }
  if (response.status === 429) {
    throw new AppError('Gemini quota or rate limit was reached. Please try again later.', 503);
  }
  if (response.status === 404) throw new AppError('The configured Gemini model is unavailable.', 503);
  throw new AppError('AI provider request failed. Please try again later.', response.status >= 500 ? 503 : 502);
}
