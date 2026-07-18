import { Schema, model, type HydratedDocument } from 'mongoose';
import { VEGETATION_ANALYSIS_TYPES, VEGETATION_SOURCES } from '@/constants/remote-monitoring.constants.js';

export interface VegetationAnalysis {
  farmPlanId: Schema.Types.ObjectId;
  sceneId: Schema.Types.ObjectId;
  ownerId: Schema.Types.ObjectId;
  analysisType: (typeof VEGETATION_ANALYSIS_TYPES)[number];
  calculatedAt: Date;
  meanValue: number;
  minimumValue: number;
  maximumValue: number;
  standardDeviation: number;
  healthyCoveragePercentage: number;
  moderateCoveragePercentage: number;
  stressedCoveragePercentage: number;
  bareSoilPercentage: number;
  waterCoveragePercentage: number;
  unavailableCoveragePercentage: number;
  healthScore: number;
  confidenceScore: number;
  source: (typeof VEGETATION_SOURCES)[number];
  rasterUrl?: string;
  tileLayerUrl?: string;
  legend: { label: string; minimum: number; maximum: number; description: string }[];
  warnings: string[];
  assumptions: string[];
  createdAt?: Date;
}

export type VegetationAnalysisDocument = HydratedDocument<VegetationAnalysis>;

const vegetationAnalysisSchema = new Schema<VegetationAnalysis>(
  {
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', required: true, index: true },
    sceneId: { type: Schema.Types.ObjectId, ref: 'RemoteSensingScene', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    analysisType: { type: String, enum: VEGETATION_ANALYSIS_TYPES, required: true, index: true },
    calculatedAt: { type: Date, default: Date.now },
    meanValue: { type: Number, required: true },
    minimumValue: { type: Number, required: true },
    maximumValue: { type: Number, required: true },
    standardDeviation: { type: Number, min: 0, required: true },
    healthyCoveragePercentage: { type: Number, min: 0, max: 100, required: true },
    moderateCoveragePercentage: { type: Number, min: 0, max: 100, required: true },
    stressedCoveragePercentage: { type: Number, min: 0, max: 100, required: true },
    bareSoilPercentage: { type: Number, min: 0, max: 100, required: true },
    waterCoveragePercentage: { type: Number, min: 0, max: 100, required: true },
    unavailableCoveragePercentage: { type: Number, min: 0, max: 100, required: true },
    healthScore: { type: Number, min: 0, max: 100, required: true },
    confidenceScore: { type: Number, min: 0, max: 100, required: true },
    source: { type: String, enum: VEGETATION_SOURCES, required: true, index: true },
    rasterUrl: { type: String, trim: true },
    tileLayerUrl: { type: String, trim: true },
    legend: [{ label: String, minimum: Number, maximum: Number, description: String }],
    warnings: [{ type: String, trim: true }],
    assumptions: [{ type: String, trim: true }],
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

vegetationAnalysisSchema.index({ farmPlanId: 1, analysisType: 1, calculatedAt: -1 });

export const VegetationAnalysisModel = model<VegetationAnalysis>('VegetationAnalysis', vegetationAnalysisSchema);

