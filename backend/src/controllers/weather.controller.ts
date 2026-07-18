import type { Request, Response } from 'express';
import {
  getCurrentWeather,
  getDiseasePredictions,
  getFarmHealthForecast,
  getPestPredictions,
  getStressPrediction,
  getWaterPrediction,
  getWeatherAlerts,
  getWeatherForecast,
  getWeatherHistory,
  getWeatherInsights,
  refreshWeather,
} from '@/services/weather.service.js';
import { sendSuccess } from '@/utils/api-response.js';
import type { WeatherFarmQuery, WeatherHistoryQuery, WeatherRefreshInput } from '@/validators/weather.validator.js';

export async function currentWeatherController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Current weather fetched.', await getCurrentWeather((req.query as unknown as WeatherFarmQuery).farmPlanId, req.user!));
}

export async function weatherForecastController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Weather forecast fetched.', await getWeatherForecast((req.query as unknown as WeatherFarmQuery).farmPlanId, req.user!));
}

export async function weatherHistoryController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Weather history fetched.', await getWeatherHistory(req.query as unknown as WeatherHistoryQuery, req.user!));
}

export async function weatherInsightsController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Weather insights fetched.', await getWeatherInsights((req.query as unknown as WeatherFarmQuery).farmPlanId, req.user!));
}

export async function weatherAlertsController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Weather alerts fetched.', await getWeatherAlerts((req.query as unknown as WeatherFarmQuery).farmPlanId, req.user!));
}

export async function refreshWeatherController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Weather refreshed.', await refreshWeather(req.body as WeatherRefreshInput, req.user!));
}

export async function pestPredictionController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Pest predictions fetched.', await getPestPredictions((req.query as unknown as WeatherFarmQuery).farmPlanId, req.user!));
}

export async function diseasePredictionController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Disease predictions fetched.', await getDiseasePredictions((req.query as unknown as WeatherFarmQuery).farmPlanId, req.user!));
}

export async function stressPredictionController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Crop stress prediction fetched.', await getStressPrediction((req.query as unknown as WeatherFarmQuery).farmPlanId, req.user!));
}

export async function waterPredictionController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Water prediction fetched.', await getWaterPrediction((req.query as unknown as WeatherFarmQuery).farmPlanId, req.user!));
}

export async function farmHealthForecastController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Farm health forecast fetched.', await getFarmHealthForecast((req.query as unknown as WeatherFarmQuery).farmPlanId, req.user!));
}

