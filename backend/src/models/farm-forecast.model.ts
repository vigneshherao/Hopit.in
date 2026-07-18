import { Schema, model, type HydratedDocument } from 'mongoose';
import { ASSISTANT_FORECAST_TYPES } from '@/constants/assistant.constants.js';

export interface FarmForecast {
  farmPlanId: Schema.Types.ObjectId;
  forecastType: (typeof ASSISTANT_FORECAST_TYPES)[number];
  prediction: string;
  confidence: number;
  estimatedDate?: Date;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export type FarmForecastDocument = HydratedDocument<FarmForecast>;

const farmForecastSchema = new Schema<FarmForecast>(
  {
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', required: true, index: true },
    forecastType: { type: String, enum: ASSISTANT_FORECAST_TYPES, required: true, index: true },
    prediction: { type: String, required: true, trim: true, maxlength: 1500 },
    confidence: { type: Number, min: 0, max: 100, required: true },
    estimatedDate: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

farmForecastSchema.index({ farmPlanId: 1, forecastType: 1, createdAt: -1 });

export const FarmForecastModel = model<FarmForecast>('FarmForecast', farmForecastSchema);

