import { z } from 'zod';
import { FARM_PLAN_STAGES, FARM_PLAN_STATUSES } from '@/constants/farm-planner.constants.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB ID.');
const positiveMoney = z.coerce.number().min(0).max(1_000_000_000);

export const generateFarmPlanSchema = z.object({
  landId: objectId,
  aiHistoryId: objectId.optional(),
  selectedCrop: z.string().trim().min(2).max(120),
  selectedSeason: z.string().trim().min(2).max(80),
  budget: positiveMoney.optional(),
  area: z.coerce.number().positive().max(100000).optional(),
  startDate: z.coerce.date().default(() => new Date()),
  notes: z.string().trim().max(1000).optional(),
});

export const farmPlanUpdateSchema = z.object({
  planTitle: z.string().trim().min(3).max(180).optional(),
  description: z.string().trim().max(3000).optional(),
  currentStage: z.enum(FARM_PLAN_STAGES).optional(),
  status: z.enum(FARM_PLAN_STATUSES).optional(),
  progress: z
    .object({
      percentage: z.coerce.number().min(0).max(100).optional(),
      completedStages: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
      nextAction: z.string().trim().max(300).optional(),
    })
    .optional(),
});

export const farmPlanQuerySchema = z.object({
  status: z.enum(FARM_PLAN_STATUSES).optional(),
  landId: objectId.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
});

export const farmPlanIdParamSchema = z.object({ id: objectId });

export const recalculateFarmPlanSchema = z.object({
  reason: z.string().trim().max(500).optional(),
  budget: positiveMoney.optional(),
  startDate: z.coerce.date().optional(),
  notes: z.string().trim().max(1000).optional(),
});

const textList = z.array(z.string().trim().min(1).max(240)).min(1).max(20);
const moneyRange = z.object({ minimum: z.coerce.number().min(0), maximum: z.coerce.number().min(0), currency: z.string().default('INR') });

export const farmPlanAIResponseSchema = z.object({
  planTitle: z.string().trim().min(3).max(180),
  description: z.string().trim().min(20).max(2000),
  farmDurationDays: z.coerce.number().int().positive(),
  farmDurationMonths: z.coerce.number().min(0),
  expectedHarvestDate: z.coerce.date(),
  currentStage: z.enum(FARM_PLAN_STAGES).default('planning'),
  landPreparation: textList,
  seedRecommendation: z.object({ variety: z.string().trim().min(2).max(160), seedRate: z.string().trim().min(2).max(160), notes: textList }),
  sowing: z.object({ method: z.string().trim().min(2).max(200), spacing: z.string().trim().min(2).max(120), steps: textList }),
  waterSchedule: z.array(z.object({ stage: z.string().trim().min(1).max(120), frequency: z.string().trim().min(1).max(160), notes: z.string().trim().min(1).max(240) })).min(1).max(20),
  fertilizerSchedule: z.array(z.object({ day: z.coerce.number().min(0), item: z.string().trim().min(1).max(160), quantity: z.string().trim().min(1).max(120), purpose: z.string().trim().min(1).max(240) })).min(1).max(20),
  pesticideSchedule: z.array(z.object({ stage: z.string().trim().min(1).max(120), treatment: z.string().trim().min(1).max(160), notes: z.string().trim().min(1).max(240) })).min(1).max(20),
  harvestSchedule: z.object({ expectedWindow: z.string().trim().min(2).max(160), steps: textList, postHarvest: textList }),
  labourRequirement: z.object({ totalWorkers: z.coerce.number().min(0), peakWorkers: z.coerce.number().min(0), notes: textList }),
  equipmentRequirement: z.object({ items: textList, estimatedCost: moneyRange }),
  fertilizerRequirement: z.object({ items: textList, estimatedCost: moneyRange }),
  waterRequirement: z.object({ level: z.enum(['low', 'medium', 'high']), estimatedLitresPerDay: z.coerce.number().min(0), notes: textList }),
  timeline: z.array(z.object({ day: z.coerce.number().min(0), stage: z.string().trim().min(1).max(120), activity: z.string().trim().min(1).max(260), expectedCost: z.coerce.number().min(0), progressWeight: z.coerce.number().min(0).max(100) })).min(5).max(40),
  riskAnalysis: z.object({ riskLevel: z.enum(['low', 'medium', 'high']), riskScore: z.coerce.number().min(0).max(100), risks: textList, mitigation: textList }),
  weatherNotes: z.string().trim().min(10).max(1200),
  estimatedInvestment: z.coerce.number().min(0),
  estimatedRevenue: z.coerce.number().min(0),
  estimatedProfit: z.coerce.number(),
  expectedROI: z.coerce.number(),
});

export type GenerateFarmPlanInput = z.infer<typeof generateFarmPlanSchema>;
export type FarmPlanUpdateInput = z.infer<typeof farmPlanUpdateSchema>;
export type FarmPlanQuery = z.infer<typeof farmPlanQuerySchema>;
export type RecalculateFarmPlanInput = z.infer<typeof recalculateFarmPlanSchema>;
