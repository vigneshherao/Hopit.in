import { Schema, model, type HydratedDocument } from 'mongoose';

export interface WeatherForecast {
  farmPlanId: Schema.Types.ObjectId;
  landId: Schema.Types.ObjectId;
  latitude: number;
  longitude: number;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  visibility?: number;
  cloudCoverage: number;
  uvIndex?: number;
  rainProbability: number;
  rainfall: number;
  sunrise?: Date;
  sunset?: Date;
  weatherCondition: string;
  forecastDate: Date;
  provider: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type WeatherForecastDocument = HydratedDocument<WeatherForecast>;

const weatherForecastSchema = new Schema<WeatherForecast>(
  {
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', required: true, index: true },
    landId: { type: Schema.Types.ObjectId, ref: 'Land', required: true, index: true },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    temperature: { type: Number, required: true },
    feelsLike: { type: Number, required: true },
    humidity: { type: Number, required: true, min: 0, max: 100 },
    pressure: { type: Number, required: true, min: 0 },
    windSpeed: { type: Number, required: true, min: 0 },
    windDirection: { type: Number, required: true, min: 0, max: 360 },
    visibility: { type: Number, min: 0 },
    cloudCoverage: { type: Number, required: true, min: 0, max: 100 },
    uvIndex: { type: Number, min: 0 },
    rainProbability: { type: Number, required: true, min: 0, max: 100 },
    rainfall: { type: Number, required: true, min: 0 },
    sunrise: { type: Date },
    sunset: { type: Date },
    weatherCondition: { type: String, required: true, trim: true },
    forecastDate: { type: Date, required: true, index: true },
    provider: { type: String, required: true, trim: true, index: true },
  },
  { timestamps: true },
);

weatherForecastSchema.index({ farmPlanId: 1, forecastDate: 1 });
weatherForecastSchema.index({ farmPlanId: 1, createdAt: -1 });

export const WeatherForecastModel = model<WeatherForecast>('WeatherForecast', weatherForecastSchema);

