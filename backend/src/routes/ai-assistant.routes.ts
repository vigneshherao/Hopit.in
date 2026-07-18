import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  assistantAnalyzeController,
  assistantChatController,
  assistantConversationsController,
  assistantForecastController,
  assistantInsightsController,
  assistantRecommendationsController,
  assistantReportController,
} from '@/controllers/ai-assistant.controller.js';
import { env } from '@/config/env.js';
import { authenticate } from '@/middleware/auth.js';
import { validateRequest } from '@/middleware/validate-request.js';
import { asyncHandler } from '@/utils/async-handler.js';
import { assistantAnalyzeSchema, assistantChatSchema, assistantQuerySchema, farmPlanIdParamSchema, reportSchema } from '@/validators/assistant.validator.js';

export const aiAssistantRouter = Router();

const assistantLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: env.aiDailyRequestLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Daily AI assistant request limit reached. Please try again tomorrow.' },
});

aiAssistantRouter.use(authenticate);
aiAssistantRouter.get('/conversations', validateRequest({ query: assistantQuerySchema }), asyncHandler(assistantConversationsController));
aiAssistantRouter.post('/chat', assistantLimiter, validateRequest({ body: assistantChatSchema }), asyncHandler(assistantChatController));
aiAssistantRouter.post('/analyze', assistantLimiter, validateRequest({ body: assistantAnalyzeSchema }), asyncHandler(assistantAnalyzeController));
aiAssistantRouter.get('/insights/:farmPlanId', validateRequest({ params: farmPlanIdParamSchema }), asyncHandler(assistantInsightsController));
aiAssistantRouter.get('/recommendations/:farmPlanId', validateRequest({ params: farmPlanIdParamSchema }), asyncHandler(assistantRecommendationsController));
aiAssistantRouter.get('/forecast/:farmPlanId', validateRequest({ params: farmPlanIdParamSchema }), asyncHandler(assistantForecastController));
aiAssistantRouter.post('/generate-report', assistantLimiter, validateRequest({ body: reportSchema }), asyncHandler(assistantReportController));

