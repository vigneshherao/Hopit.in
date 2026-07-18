import { apiClient } from '@/services/apiClient.js';

const withFarmPlan = (farmPlanId) => ({ farmPlanId });

export async function getCurrentWeather(farmPlanId) {
  const response = await apiClient.get('/weather/current', { params: withFarmPlan(farmPlanId) });
  return response.data.data;
}

export async function getWeatherForecast(farmPlanId) {
  const response = await apiClient.get('/weather/forecast', { params: withFarmPlan(farmPlanId) });
  return response.data.data;
}

export async function getWeatherInsights(farmPlanId) {
  const response = await apiClient.get('/weather/insights', { params: withFarmPlan(farmPlanId) });
  return response.data.data;
}

export async function getWeatherAlerts(farmPlanId) {
  const response = await apiClient.get('/weather/alerts', { params: withFarmPlan(farmPlanId) });
  return response.data.data;
}

export async function refreshWeather(payload) {
  const response = await apiClient.post('/weather/refresh', payload);
  return response.data.data;
}

export async function getPestPrediction(farmPlanId) {
  const response = await apiClient.get('/weather/predictions/pests', { params: withFarmPlan(farmPlanId) });
  return response.data.data;
}

export async function getDiseasePrediction(farmPlanId) {
  const response = await apiClient.get('/weather/predictions/diseases', { params: withFarmPlan(farmPlanId) });
  return response.data.data;
}

export async function getStressPrediction(farmPlanId) {
  const response = await apiClient.get('/weather/predictions/stress', { params: withFarmPlan(farmPlanId) });
  return response.data.data;
}

export async function getWaterPrediction(farmPlanId) {
  const response = await apiClient.get('/weather/predictions/water', { params: withFarmPlan(farmPlanId) });
  return response.data.data;
}

export async function getFarmHealthForecast(farmPlanId) {
  const response = await apiClient.get('/weather/predictions/farm-health', { params: withFarmPlan(farmPlanId) });
  return response.data.data;
}

