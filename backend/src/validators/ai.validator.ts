import { z } from 'zod';
import {
  AI_RISK_LEVELS,
  AI_SEASONS,
  FARMING_EXPERIENCE_LEVELS,
  FARMING_TYPES,
  MARKET_DEMAND_LEVELS,
  WATER_REQUIREMENT_LEVELS,
} from '@/constants/ai.constants.js';
import {
  LAND_AREA_UNITS_EXTENDED,
  LAND_SOIL_TYPES_EXTENDED,
  LAND_WATER_AVAILABILITY,
} from '@/constants/land.constants.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB ID.');
const safeText = z.string().trim().min(1).max(600);
const optionalSafeText = z.string().trim().max(600).optional();
const safeTextArray = z.array(z.string().trim().min(1).max(80)).max(12).default([]);

const manualInputSchema = z.object({
  soilType: z.enum(LAND_SOIL_TYPES_EXTENDED).optional(),
  landArea: z.coerce.number().positive().max(100000).optional(),
  areaUnit: z.enum(LAND_AREA_UNITS_EXTENDED).optional(),
  state: optionalSafeText,
  district: optionalSafeText,
  season: z.enum(AI_SEASONS).optional(),
  temperature: z.coerce.number().min(-20).max(60).optional(),
  rainfall: z.coerce.number().min(0).max(10000).optional(),
  waterAvailability: z.enum(LAND_WATER_AVAILABILITY).optional(),
  irrigationAvailable: z.boolean().optional(),
  budget: z.coerce.number().min(0).max(1_000_000_000).optional(),
  farmingExperience: z.enum(FARMING_EXPERIENCE_LEVELS).optional(),
  preferredFarmingType: z.enum(FARMING_TYPES).optional(),
  preferredCrops: safeTextArray,
  marketDistanceKm: z.coerce.number().min(0).max(2000).optional(),
  roadAccess: z.boolean().optional(),
  ownerParticipation: z.boolean().optional(),
});

export const aiAnalysisRequestSchema = manualInputSchema
  .extend({
    landId: objectId.optional(),
    notes: z.string().trim().max(1000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.landId) return;
    const requiredFields = ['soilType', 'landArea', 'areaUnit', 'state', 'district'] as const;
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === '') {
        ctx.addIssue({ code: 'custom', path: [field], message: 'Required when no land is selected.' });
      }
    }
  });

export const aiChatRequestSchema = z.object({
  landId: objectId.optional(),
  historyId: objectId.optional(),
  message: z.string().trim().min(2).max(700),
});

export const aiHistoryQuerySchema = z.object({
  feature: z.enum(['land-analysis', 'crop-recommendation', 'business-recommendation', 'chat']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
});

export const aiHistoryParamSchema = z.object({ id: objectId });

const score = z.coerce.number().min(0).max(100);
const moneyRange = z.object({ minimum: z.coerce.number().min(0), maximum: z.coerce.number().min(0), currency: z.string().default('INR') });
const textList = z.array(z.string().trim().min(1).max(240)).min(1).max(12);

export const landAnalysisResponseSchema = z.object({
  landHealthScore: score,
  soilSuitability: z.object({ score, summary: safeText, recommendedImprovements: textList }),
  waterAssessment: z.object({ score, summary: safeText, limitations: textList }),
  climateSuitability: z.object({ score, summary: safeText }),
  landStrengths: textList,
  landLimitations: textList,
  riskScore: score,
  riskLevel: z.enum(AI_RISK_LEVELS),
  preparationSteps: textList,
  suitableCategories: textList,
  explanation: z.string().trim().min(20).max(1800),
});

export const cropRecommendationSchema = z.object({
  cropName: safeText,
  suitabilityScore: score,
  reason: z.string().trim().min(10).max(1000),
  idealSeason: safeText,
  estimatedDuration: safeText,
  waterRequirement: z.enum(WATER_REQUIREMENT_LEVELS),
  investmentRange: moneyRange,
  expectedYieldRange: z.object({ minimum: z.coerce.number().min(0), maximum: z.coerce.number().min(0), unit: safeText }),
  expectedRevenueRange: moneyRange,
  expectedProfitRange: moneyRange,
  roiRange: z.object({ minimum: z.coerce.number(), maximum: z.coerce.number(), unit: z.literal('percentage').default('percentage') }),
  marketDemand: z.enum(MARKET_DEMAND_LEVELS),
  majorRisks: textList,
  soilPreparation: textList,
  seedRecommendation: safeText,
  irrigationPlan: textList,
  fertilizerPlan: textList,
  labourRequirement: safeText,
  confidenceScore: score,
});

export const cropRecommendationResponseSchema = z.object({
  summary: z.string().trim().min(20).max(1800),
  topRecommendedCrop: safeText,
  recommendations: z.array(cropRecommendationSchema).min(5).max(10),
});

export const businessRecommendationResponseSchema = z.object({
  summary: z.string().trim().min(20).max(1800),
  options: z
    .array(
      z.object({
        optionName: safeText,
        suitabilityScore: score,
        reason: z.string().trim().min(10).max(1000),
        setupCost: moneyRange,
        operatingCost: moneyRange,
        expectedReturn: moneyRange,
        duration: safeText,
        infrastructureNeeds: textList,
        workerNeeds: textList,
        permissions: textList,
        risks: textList,
      }),
    )
    .min(4)
    .max(10),
});

export const aiChatResponseSchema = z.object({
  answer: z.string().trim().min(10).max(2200),
  suggestedQuestions: z.array(z.string().trim().min(4).max(160)).min(1).max(6),
  confidenceScore: score,
});

export type AIAnalysisInput = z.infer<typeof aiAnalysisRequestSchema>;
export type AIChatInput = z.infer<typeof aiChatRequestSchema>;
export type AIHistoryQuery = z.infer<typeof aiHistoryQuerySchema>;
