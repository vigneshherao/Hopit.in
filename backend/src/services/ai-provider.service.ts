import { env } from '@/config/env.js';
import { AppError } from '@/utils/app-error.js';

export interface AIProviderRequest {
  systemPrompt: string;
  userPrompt: string;
  responseFormatName: string;
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
}

class OpenAIProvider implements AIProvider {
  readonly provider = 'openai';
  readonly model = env.openaiModel;

  async generateJson(request: AIProviderRequest): Promise<AIProviderResponse> {
    if (!env.openaiApiKey) {
      throw new AppError('AI provider is not configured. Set OPENAI_API_KEY on the backend.', 503);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.aiRequestTimeoutMs);
    const startedAt = Date.now();

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${env.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.2,
          max_tokens: 3500,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: request.systemPrompt },
            { role: 'user', content: request.userPrompt },
          ],
        }),
      });

      if (!response.ok) {
        throw new AppError('AI provider request failed. Please try again later.', response.status >= 500 ? 503 : 502);
      }

      const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
      const content = payload.choices?.[0]?.message?.content;
      if (!content || content.length > 60_000) {
        throw new AppError('AI provider returned an empty or oversized response.', 502);
      }

      return {
        provider: this.provider,
        model: this.model,
        content,
        durationMs: Date.now() - startedAt,
      };
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

export function getAIProvider(): AIProvider {
  return new OpenAIProvider();
}
