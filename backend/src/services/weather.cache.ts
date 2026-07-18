import { env } from '@/config/env.js';
import { WeatherForecastModel } from '@/models/weather-forecast.model.js';

export async function getCachedForecast(farmPlanId: string) {
  const since = new Date(Date.now() - env.weatherCacheTtlMinutes * 60_000);
  const forecasts = await WeatherForecastModel.find({ farmPlanId, createdAt: { $gte: since } }).sort({ forecastDate: 1 }).lean();
  return forecasts.length >= 3 ? forecasts : null;
}

export async function replaceForecastCache(farmPlanId: string, forecasts: Record<string, unknown>[]) {
  await WeatherForecastModel.deleteMany({ farmPlanId });
  if (!forecasts.length) return [];
  return WeatherForecastModel.insertMany(forecasts);
}

