import { Schema, model, type HydratedDocument } from 'mongoose';
import { WEATHER_ALERT_CATEGORIES, WEATHER_PRIORITIES } from '@/constants/weather.constants.js';

export interface WeatherInsight {
  farmPlanId: Schema.Types.ObjectId;
  title: string;
  category: (typeof WEATHER_ALERT_CATEGORIES)[number];
  priority: (typeof WEATHER_PRIORITIES)[number];
  description: string;
  recommendation: string;
  riskScore: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type WeatherInsightDocument = HydratedDocument<WeatherInsight>;

const weatherInsightSchema = new Schema<WeatherInsight>(
  {
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    category: { type: String, enum: WEATHER_ALERT_CATEGORIES, required: true, index: true },
    priority: { type: String, enum: WEATHER_PRIORITIES, required: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 1200 },
    recommendation: { type: String, required: true, trim: true, maxlength: 1200 },
    riskScore: { type: Number, required: true, min: 0, max: 100 },
  },
  { timestamps: true },
);

weatherInsightSchema.index({ farmPlanId: 1, priority: 1, createdAt: -1 });

export const WeatherInsightModel = model<WeatherInsight>('WeatherInsight', weatherInsightSchema);

