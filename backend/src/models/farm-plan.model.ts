import { Schema, model, type HydratedDocument } from 'mongoose';
import { FARM_PLAN_STAGES, FARM_PLAN_STATUSES, type FarmPlanStage, type FarmPlanStatus } from '@/constants/farm-planner.constants.js';

export interface FarmPlan {
  ownerId: Schema.Types.ObjectId;
  landId: Schema.Types.ObjectId;
  selectedCrop: string;
  selectedSeason: string;
  planTitle: string;
  description?: string;
  startDate: Date;
  expectedHarvestDate: Date;
  farmDurationDays: number;
  farmDurationMonths: number;
  currentStage: FarmPlanStage;
  status: FarmPlanStatus;
  AIRecommendation: Record<string, unknown>;
  versions: {
    version: number;
    reason?: string;
    AIRecommendation: Record<string, unknown>;
    estimatedInvestment: number;
    estimatedRevenue: number;
    estimatedProfit: number;
    expectedROI: number;
    createdAt: Date;
  }[];
  estimatedInvestment: number;
  estimatedRevenue: number;
  estimatedProfit: number;
  expectedROI: number;
  labourRequirement: Record<string, unknown>;
  equipmentRequirement: Record<string, unknown>;
  fertilizerRequirement: Record<string, unknown>;
  waterRequirement: Record<string, unknown>;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  weatherNotes?: string;
  progress: {
    percentage: number;
    completedStages: string[];
    nextAction?: string;
    updatedAt?: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export type FarmPlanDocument = HydratedDocument<FarmPlan>;

const mixed = Schema.Types.Mixed;

const farmPlanSchema = new Schema<FarmPlan>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    landId: { type: Schema.Types.ObjectId, ref: 'Land', required: true, index: true },
    selectedCrop: { type: String, required: true, trim: true, index: true },
    selectedSeason: { type: String, required: true, trim: true, index: true },
    planTitle: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, trim: true, maxlength: 3000 },
    startDate: { type: Date, required: true, index: true },
    expectedHarvestDate: { type: Date, required: true },
    farmDurationDays: { type: Number, required: true, min: 1 },
    farmDurationMonths: { type: Number, required: true, min: 0 },
    currentStage: { type: String, enum: FARM_PLAN_STAGES, default: 'planning', index: true },
    status: { type: String, enum: FARM_PLAN_STATUSES, default: 'draft', index: true },
    AIRecommendation: { type: mixed, required: true },
    versions: [
      {
        version: { type: Number, required: true },
        reason: { type: String, trim: true },
        AIRecommendation: { type: mixed, required: true },
        estimatedInvestment: { type: Number, min: 0, required: true },
        estimatedRevenue: { type: Number, min: 0, required: true },
        estimatedProfit: { type: Number, required: true },
        expectedROI: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    estimatedInvestment: { type: Number, min: 0, required: true },
    estimatedRevenue: { type: Number, min: 0, required: true },
    estimatedProfit: { type: Number, required: true },
    expectedROI: { type: Number, required: true },
    labourRequirement: { type: mixed, required: true },
    equipmentRequirement: { type: mixed, required: true },
    fertilizerRequirement: { type: mixed, required: true },
    waterRequirement: { type: mixed, required: true },
    riskLevel: { type: String, enum: ['low', 'medium', 'high'], required: true, index: true },
    riskScore: { type: Number, min: 0, max: 100, required: true },
    weatherNotes: { type: String, trim: true, maxlength: 1200 },
    progress: {
      percentage: { type: Number, min: 0, max: 100, default: 0 },
      completedStages: [{ type: String, trim: true }],
      nextAction: { type: String, trim: true },
      updatedAt: { type: Date },
    },
  },
  { timestamps: true },
);

farmPlanSchema.index({ ownerId: 1, status: 1, updatedAt: -1 });
farmPlanSchema.index({ landId: 1, selectedCrop: 1, createdAt: -1 });

export const FarmPlanModel = model<FarmPlan>('FarmPlan', farmPlanSchema);
