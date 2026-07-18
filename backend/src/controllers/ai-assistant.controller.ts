import type { Request, Response } from 'express';
import {
  analyzeFarmWithAssistant,
  chatWithFarmAssistant,
  generateFarmReport,
  getFarmForecast,
  getFarmInsights,
  getFarmRecommendations,
  listAssistantConversations,
} from '@/services/ai-assistant.service.js';
import { sendSuccess } from '@/utils/api-response.js';
import type { AssistantAnalyzeInput, AssistantChatInput, AssistantQuery, AssistantReportInput } from '@/validators/assistant.validator.js';

export async function assistantChatController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 201, 'Assistant response generated.', await chatWithFarmAssistant(req.body as AssistantChatInput, req.user!));
}

export async function assistantAnalyzeController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 201, 'Assistant analysis generated.', await analyzeFarmWithAssistant(req.body as AssistantAnalyzeInput, req.user!));
}

export async function assistantInsightsController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Farm insights fetched.', await getFarmInsights(String(req.params.farmPlanId), req.user!));
}

export async function assistantRecommendationsController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Farm recommendations fetched.', await getFarmRecommendations(String(req.params.farmPlanId), req.user!));
}

export async function assistantForecastController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Farm forecast fetched.', await getFarmForecast(String(req.params.farmPlanId), req.user!));
}

export async function assistantReportController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 201, 'Farm report generated.', await generateFarmReport(req.body as AssistantReportInput, req.user!));
}

export async function assistantConversationsController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Assistant conversations fetched.', await listAssistantConversations(req.query as unknown as AssistantQuery, req.user!));
}

