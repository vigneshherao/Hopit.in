import { Schema, model, type HydratedDocument } from 'mongoose';
import { WEATHER_DISEASE_TYPES, WEATHER_RISK_LEVELS } from '@/constants/weather.constants.js';

export interface DiseasePrediction {
  farmPlanId: Schema.Types.ObjectId;
  diseaseName: (typeof WEATHER_DISEASE_TYPES)[number];
  riskLevel: (typeof WEATHER_RISK_LEVELS)[number];
  confidence: number;
  reasons: string[];
  weatherFactors: string[];
  recommendedMonitoring: string[];
  organicPrevention: string[];
  chemicalPrevention: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type DiseasePredictionDocument = HydratedDocument<DiseasePrediction>;

const diseasePredictionSchema = new Schema<DiseasePrediction>(
  {
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', required: true, index: true },
    diseaseName: { type: String, enum: WEATHER_DISEASE_TYPES, required: true, index: true },
    riskLevel: { type: String, enum: WEATHER_RISK_LEVELS, required: true, index: true },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    reasons: [{ type: String, trim: true }],
    weatherFactors: [{ type: String, trim: true }],
    recommendedMonitoring: [{ type: String, trim: true }],
    organicPrevention: [{ type: String, trim: true }],
    chemicalPrevention: [{ type: String, trim: true }],
  },
  { timestamps: true },
);

diseasePredictionSchema.index({ farmPlanId: 1, riskLevel: 1, createdAt: -1 });

export const DiseasePredictionModel = model<DiseasePrediction>('DiseasePrediction', diseasePredictionSchema);

