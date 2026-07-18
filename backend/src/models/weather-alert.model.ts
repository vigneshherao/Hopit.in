import { Schema, model, type HydratedDocument } from 'mongoose';
import { WEATHER_ALERT_CATEGORIES, WEATHER_PRIORITIES } from '@/constants/weather.constants.js';

export interface WeatherAlert {
  farmPlanId: Schema.Types.ObjectId;
  title: string;
  category: (typeof WEATHER_ALERT_CATEGORIES)[number];
  priority: (typeof WEATHER_PRIORITIES)[number];
  message: string;
  recommendedAction: string;
  forecastDate?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type WeatherAlertDocument = HydratedDocument<WeatherAlert>;

const weatherAlertSchema = new Schema<WeatherAlert>(
  {
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    category: { type: String, enum: WEATHER_ALERT_CATEGORIES, required: true, index: true },
    priority: { type: String, enum: WEATHER_PRIORITIES, required: true, index: true },
    message: { type: String, required: true, trim: true, maxlength: 1200 },
    recommendedAction: { type: String, required: true, trim: true, maxlength: 1200 },
    forecastDate: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

weatherAlertSchema.index({ farmPlanId: 1, isActive: 1, priority: 1 });

export const WeatherAlertModel = model<WeatherAlert>('WeatherAlert', weatherAlertSchema);

