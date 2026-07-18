import { Schema, model, type HydratedDocument } from 'mongoose';
import { DISEASE_ANALYSIS_STATUSES, DISEASE_SEVERITIES } from '@/constants/disease.constants.js';

export interface DiseaseAnalysis {
  ownerId: Schema.Types.ObjectId;
  farmPlanId?: Schema.Types.ObjectId;
  landId?: Schema.Types.ObjectId;
  cropName: string;
  analysisStatus: (typeof DISEASE_ANALYSIS_STATUSES)[number];
  analysisProvider?: string;
  analysisVersion: string;
  diseaseName: string;
  summary: string;
  confidenceScore: number;
  severity: (typeof DISEASE_SEVERITIES)[number];
  cropHealthScore: number;
  symptoms: string[];
  causes: string[];
  organicTreatment: string[];
  chemicalTreatment: string[];
  prevention: string[];
  monitoringAdvice: string[];
  estimatedRecoveryDays: number;
  estimatedTreatmentCost: number;
  notes?: string;
  weatherRisk?: string;
  processingTimeMs?: number;
  cacheKey?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type DiseaseAnalysisDocument = HydratedDocument<DiseaseAnalysis>;

const diseaseAnalysisSchema = new Schema<DiseaseAnalysis>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', index: true },
    landId: { type: Schema.Types.ObjectId, ref: 'Land', index: true },
    cropName: { type: String, required: true, trim: true, index: true },
    analysisStatus: { type: String, enum: DISEASE_ANALYSIS_STATUSES, default: 'completed', index: true },
    analysisProvider: { type: String, trim: true },
    analysisVersion: { type: String, default: '2026-07', trim: true },
    diseaseName: { type: String, required: true, trim: true, index: true },
    summary: { type: String, required: true, trim: true, maxlength: 2000 },
    confidenceScore: { type: Number, required: true, min: 0, max: 100 },
    severity: { type: String, enum: DISEASE_SEVERITIES, required: true, index: true },
    cropHealthScore: { type: Number, required: true, min: 0, max: 100 },
    symptoms: [{ type: String, trim: true }],
    causes: [{ type: String, trim: true }],
    organicTreatment: [{ type: String, trim: true }],
    chemicalTreatment: [{ type: String, trim: true }],
    prevention: [{ type: String, trim: true }],
    monitoringAdvice: [{ type: String, trim: true }],
    estimatedRecoveryDays: { type: Number, min: 0, default: 0 },
    estimatedTreatmentCost: { type: Number, min: 0, default: 0 },
    notes: { type: String, trim: true, maxlength: 2000 },
    weatherRisk: { type: String, trim: true, maxlength: 1200 },
    processingTimeMs: { type: Number, min: 0 },
    cacheKey: { type: String, trim: true, index: true },
  },
  { timestamps: true },
);

diseaseAnalysisSchema.index({ ownerId: 1, createdAt: -1 });
diseaseAnalysisSchema.index({ farmPlanId: 1, createdAt: -1 });
diseaseAnalysisSchema.index({ ownerId: 1, cropName: 1, diseaseName: 1 });

export const DiseaseAnalysisModel = model<DiseaseAnalysis>('DiseaseAnalysis', diseaseAnalysisSchema);

