import { z } from 'zod';
import { DISEASE_RECOMMENDATION_CATEGORIES, DISEASE_RECOMMENDATION_PRIORITIES, DISEASE_SEVERITIES } from '@/constants/disease.constants.js';

export const diseaseAnalyzeBodySchema = z.object({
  farmPlanId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid farm plan id.').optional(),
  cropName: z.string().trim().min(2).max(80),
  farmerState: z.string().trim().max(80).optional(),
  weatherSummary: z.string().trim().max(500).optional(),
});

export const diseaseHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  farmPlanId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid farm plan id.').optional(),
  cropName: z.string().trim().max(80).optional(),
  severity: z.enum(DISEASE_SEVERITIES).optional(),
});

export const diseaseIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid disease analysis id.'),
});

export const diseaseFarmParamSchema = z.object({
  farmPlanId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid farm plan id.'),
});

export const diseaseAIResponseSchema = z.object({
  summary: z.string().min(1).max(2000),
  confidenceScore: z.number().min(0).max(100),
  cropHealthScore: z.number().min(0).max(100),
  severity: z.enum(DISEASE_SEVERITIES),
  disease: z.string().min(1).max(160),
  symptoms: z.array(z.string().min(1).max(220)).max(12),
  causes: z.array(z.string().min(1).max(220)).max(12),
  organicTreatment: z.array(z.string().min(1).max(260)).max(12),
  chemicalTreatment: z.array(z.string().min(1).max(260)).max(12),
  prevention: z.array(z.string().min(1).max(260)).max(12),
  monitoringAdvice: z.array(z.string().min(1).max(260)).max(12),
  estimatedRecoveryDays: z.number().int().min(0).max(365),
  estimatedTreatmentCost: z.number().min(0).max(10_000_000),
  weatherRisk: z.string().min(1).max(1200),
  recommendations: z
    .array(
      z.object({
        title: z.string().min(1).max(180),
        description: z.string().min(1).max(1200),
        priority: z.enum(DISEASE_RECOMMENDATION_PRIORITIES),
        category: z.enum(DISEASE_RECOMMENDATION_CATEGORIES),
        estimatedCost: z.number().min(0).optional(),
      }),
    )
    .max(12),
});

export type DiseaseAnalyzeBody = z.infer<typeof diseaseAnalyzeBodySchema>;
export type DiseaseHistoryQuery = z.infer<typeof diseaseHistoryQuerySchema>;
export type DiseaseAIResponse = z.infer<typeof diseaseAIResponseSchema>;

