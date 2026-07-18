import multer from 'multer';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  analyzeDiseaseController,
  analyzeMultipleDiseaseController,
  deleteDiseaseAnalysisController,
  diseaseAnalysisController,
  diseaseHistoryController,
  diseaseStatisticsController,
  farmDiseaseHistoryController,
  latestDiseaseAnalysisController,
} from '@/controllers/disease.controller.js';
import { env } from '@/config/env.js';
import { DISEASE_MAX_IMAGE_SIZE_BYTES, DISEASE_MAX_IMAGES } from '@/constants/disease.constants.js';
import { authenticate } from '@/middleware/auth.js';
import { validateRequest } from '@/middleware/validate-request.js';
import { asyncHandler } from '@/utils/async-handler.js';
import { diseaseAnalyzeBodySchema, diseaseFarmParamSchema, diseaseHistoryQuerySchema, diseaseIdParamSchema } from '@/validators/disease.validator.js';

export const diseaseRouter = Router();

const diseaseUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: DISEASE_MAX_IMAGE_SIZE_BYTES, files: DISEASE_MAX_IMAGES },
});

const diseaseLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: env.aiDailyRequestLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Daily disease analysis limit reached. Please try again tomorrow.' },
});

diseaseRouter.use(authenticate);
diseaseRouter.post('/analyze', diseaseLimiter, diseaseUpload.array('images', 1), validateRequest({ body: diseaseAnalyzeBodySchema }), asyncHandler(analyzeDiseaseController));
diseaseRouter.post('/analyze-multiple', diseaseLimiter, diseaseUpload.array('images', DISEASE_MAX_IMAGES), validateRequest({ body: diseaseAnalyzeBodySchema }), asyncHandler(analyzeMultipleDiseaseController));
diseaseRouter.get('/history', validateRequest({ query: diseaseHistoryQuerySchema }), asyncHandler(diseaseHistoryController));
diseaseRouter.get('/statistics', asyncHandler(diseaseStatisticsController));
diseaseRouter.get('/latest', asyncHandler(latestDiseaseAnalysisController));
diseaseRouter.get('/farm/:farmPlanId', validateRequest({ params: diseaseFarmParamSchema }), asyncHandler(farmDiseaseHistoryController));
diseaseRouter.get('/history/:id', validateRequest({ params: diseaseIdParamSchema }), asyncHandler(diseaseAnalysisController));
diseaseRouter.delete('/history/:id', validateRequest({ params: diseaseIdParamSchema }), asyncHandler(deleteDiseaseAnalysisController));

