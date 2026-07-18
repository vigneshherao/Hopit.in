import type { Request, Response } from 'express';
import { sendSuccess } from '@/utils/api-response.js';
import {
  analyzeLand,
  chatWithAI,
  deleteAIHistoryItem,
  getAIHistoryItem,
  listAIHistory,
  recommendBusiness,
  recommendCrops,
} from '@/services/ai.service.js';
import type { AIAnalysisInput, AIChatInput, AIHistoryQuery } from '@/validators/ai.validator.js';

export async function landAnalysisController(req: Request, res: Response): Promise<void> {
  const result = await analyzeLand(req.body as AIAnalysisInput, req.user!);
  sendSuccess(res, 201, 'Land analysis generated.', result);
}

export async function cropRecommendationController(req: Request, res: Response): Promise<void> {
  const result = await recommendCrops(req.body as AIAnalysisInput, req.user!);
  sendSuccess(res, 201, 'Crop recommendations generated.', result);
}

export async function businessRecommendationController(req: Request, res: Response): Promise<void> {
  const result = await recommendBusiness(req.body as AIAnalysisInput, req.user!);
  sendSuccess(res, 201, 'Business recommendations generated.', result);
}

export async function aiChatController(req: Request, res: Response): Promise<void> {
  const result = await chatWithAI(req.body as AIChatInput, req.user!);
  sendSuccess(res, 201, 'AI chat response generated.', result);
}

export async function aiHistoryController(req: Request, res: Response): Promise<void> {
  const result = await listAIHistory(req.query as unknown as AIHistoryQuery, req.user!);
  sendSuccess(res, 200, 'AI history fetched.', result);
}

export async function aiHistoryItemController(req: Request, res: Response): Promise<void> {
  const result = await getAIHistoryItem(String(req.params.id), req.user!);
  sendSuccess(res, 200, 'AI history item fetched.', result);
}

export async function deleteAIHistoryController(req: Request, res: Response): Promise<void> {
  const result = await deleteAIHistoryItem(String(req.params.id), req.user!);
  sendSuccess(res, 200, 'AI history item deleted.', result);
}
