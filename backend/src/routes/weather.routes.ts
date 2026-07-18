import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  currentWeatherController,
  diseasePredictionController,
  farmHealthForecastController,
  pestPredictionController,
  refreshWeatherController,
  stressPredictionController,
  waterPredictionController,
  weatherAlertsController,
  weatherForecastController,
  weatherHistoryController,
  weatherInsightsController,
} from '@/controllers/weather.controller.js';
import { authenticate } from '@/middleware/auth.js';
import { validateRequest } from '@/middleware/validate-request.js';
import { asyncHandler } from '@/utils/async-handler.js';
import { weatherFarmQuerySchema, weatherHistoryQuerySchema, weatherRefreshSchema } from '@/validators/weather.validator.js';

export const weatherRouter = Router();

const weatherRefreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Weather refresh limit reached. Please try again later.' },
});

weatherRouter.use(authenticate);
weatherRouter.get('/current', validateRequest({ query: weatherFarmQuerySchema }), asyncHandler(currentWeatherController));
weatherRouter.get('/forecast', validateRequest({ query: weatherFarmQuerySchema }), asyncHandler(weatherForecastController));
weatherRouter.get('/history', validateRequest({ query: weatherHistoryQuerySchema }), asyncHandler(weatherHistoryController));
weatherRouter.get('/insights', validateRequest({ query: weatherFarmQuerySchema }), asyncHandler(weatherInsightsController));
weatherRouter.get('/alerts', validateRequest({ query: weatherFarmQuerySchema }), asyncHandler(weatherAlertsController));
weatherRouter.post('/refresh', weatherRefreshLimiter, validateRequest({ body: weatherRefreshSchema }), asyncHandler(refreshWeatherController));
weatherRouter.get('/predictions/pests', validateRequest({ query: weatherFarmQuerySchema }), asyncHandler(pestPredictionController));
weatherRouter.get('/predictions/diseases', validateRequest({ query: weatherFarmQuerySchema }), asyncHandler(diseasePredictionController));
weatherRouter.get('/predictions/stress', validateRequest({ query: weatherFarmQuerySchema }), asyncHandler(stressPredictionController));
weatherRouter.get('/predictions/water', validateRequest({ query: weatherFarmQuerySchema }), asyncHandler(waterPredictionController));
weatherRouter.get('/predictions/farm-health', validateRequest({ query: weatherFarmQuerySchema }), asyncHandler(farmHealthForecastController));

