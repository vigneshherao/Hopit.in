import { Schema, model, type HydratedDocument } from 'mongoose';
import { PEST_TYPES, WEATHER_RISK_LEVELS } from '@/constants/weather.constants.js';

export interface PestPrediction {
  farmPlanId: Schema.Types.ObjectId;
  pestName: (typeof PEST_TYPES)[number];
  riskLevel: (typeof WEATHER_RISK_LEVELS)[number];
  confidence: number;
  symptomsToWatch: string[];
  earlyDetection: string[];
  preventiveMeasures: string[];
  estimatedDamage: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PestPredictionDocument = HydratedDocument<PestPrediction>;

const pestPredictionSchema = new Schema<PestPrediction>(
  {
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', required: true, index: true },
    pestName: { type: String, enum: PEST_TYPES, required: true, index: true },
    riskLevel: { type: String, enum: WEATHER_RISK_LEVELS, required: true, index: true },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    symptomsToWatch: [{ type: String, trim: true }],
    earlyDetection: [{ type: String, trim: true }],
    preventiveMeasures: [{ type: String, trim: true }],
    estimatedDamage: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

pestPredictionSchema.index({ farmPlanId: 1, riskLevel: 1, createdAt: -1 });

export const PestPredictionModel = model<PestPrediction>('PestPrediction', pestPredictionSchema);

