import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  aiChatController,
  aiHistoryController,
  aiHistoryItemController,
  businessRecommendationController,
  cropRecommendationController,
  deleteAIHistoryController,
  landAnalysisController,
} from '@/controllers/ai.controller.js';
import { env } from '@/config/env.js';
import { authenticate } from '@/middleware/auth.js';
import { validateRequest } from '@/middleware/validate-request.js';
import { asyncHandler } from '@/utils/async-handler.js';
import { aiAnalysisRequestSchema, aiChatRequestSchema, aiHistoryParamSchema, aiHistoryQuerySchema } from '@/validators/ai.validator.js';

export const aiRouter = Router();

const aiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: env.aiDailyRequestLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Daily AI request limit reached. Please try again tomorrow.' },
});

aiRouter.use(authenticate);
aiRouter.post('/land-analysis', aiLimiter, validateRequest({ body: aiAnalysisRequestSchema }), asyncHandler(landAnalysisController));
aiRouter.post('/crop-recommendation', aiLimiter, validateRequest({ body: aiAnalysisRequestSchema }), asyncHandler(cropRecommendationController));
aiRouter.post('/business-recommendation', aiLimiter, validateRequest({ body: aiAnalysisRequestSchema }), asyncHandler(businessRecommendationController));
aiRouter.post('/chat', aiLimiter, validateRequest({ body: aiChatRequestSchema }), asyncHandler(aiChatController));
aiRouter.get('/history', validateRequest({ query: aiHistoryQuerySchema }), asyncHandler(aiHistoryController));
aiRouter.get('/history/:id', validateRequest({ params: aiHistoryParamSchema }), asyncHandler(aiHistoryItemController));
aiRouter.delete('/history/:id', validateRequest({ params: aiHistoryParamSchema }), asyncHandler(deleteAIHistoryController));
