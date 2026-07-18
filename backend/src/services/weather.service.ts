import { DiseasePredictionModel } from '@/models/disease-prediction.model.js';
import { FarmPlanModel } from '@/models/farm-plan.model.js';
import { LandModel } from '@/models/land.model.js';
import { NotificationModel } from '@/models/notification.model.js';
import { PestPredictionModel } from '@/models/pest-prediction.model.js';
import { WeatherAlertModel } from '@/models/weather-alert.model.js';
import { WeatherForecastModel, type WeatherForecast } from '@/models/weather-forecast.model.js';
import { WeatherInsightModel } from '@/models/weather-insight.model.js';
import { getCachedForecast, replaceForecastCache } from '@/services/weather.cache.js';
import { getWeatherProvider } from '@/services/weather.provider.js';
import type { AuthenticatedUser } from '@/types/http.js';
import { AppError } from '@/utils/app-error.js';
import type { WeatherHistoryQuery, WeatherRefreshInput } from '@/validators/weather.validator.js';

export async function getCurrentWeather(farmPlanId: string, user: AuthenticatedUser) {
  const forecasts = await ensureForecast(farmPlanId, user);
  return { current: forecasts[0], summary: summarizeWeather(forecasts) };
}

export async function getWeatherForecast(farmPlanId: string, user: AuthenticatedUser) {
  const forecasts = await ensureForecast(farmPlanId, user);
  return { forecasts, charts: buildWeatherCharts(forecasts), summary: summarizeWeather(forecasts) };
}

export async function getWeatherHistory(query: WeatherHistoryQuery, user: AuthenticatedUser) {
  await getOwnedFarmPlan(query.farmPlanId, user);
  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    WeatherForecastModel.find({ farmPlanId: query.farmPlanId }).sort({ forecastDate: -1 }).skip(skip).limit(query.limit).lean(),
    WeatherForecastModel.countDocuments({ farmPlanId: query.farmPlanId }),
  ]);
  return { forecasts: items, pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) || 1 } };
}

export async function refreshWeather(input: WeatherRefreshInput, user: AuthenticatedUser) {
  const { plan, land, coordinates } = await getPlanLandAndCoordinates(input.farmPlanId, user);
  if (!input.force) {
    const cached = await getCachedForecast(input.farmPlanId);
    if (cached) return { forecasts: cached, cached: true };
  }
  const provider = getWeatherProvider();
  const forecasts = await provider.getForecast(coordinates);
  const saved = await replaceForecastCache(
    input.farmPlanId,
    forecasts.map((forecast) => ({ ...forecast, farmPlanId: plan._id, landId: land._id })),
  );
  await generatePredictionsAndAlerts(input.farmPlanId, user, saved as unknown as WeatherForecast[]);
  return { forecasts: saved, cached: false };
}

export async function getWeatherInsights(farmPlanId: string, user: AuthenticatedUser) {
  const forecasts = await ensureForecast(farmPlanId, user);
  const insights = buildInsights(farmPlanId, forecasts);
  await replaceInsights(farmPlanId, insights);
  return { insights, riskTrend: buildRiskTrend(forecasts) };
}

export async function getWeatherAlerts(farmPlanId: string, user: AuthenticatedUser) {
  await getOwnedFarmPlan(farmPlanId, user);
  const alerts = await WeatherAlertModel.find({ farmPlanId, isActive: true }).sort({ priority: 1, createdAt: -1 }).lean();
  return { alerts };
}

export async function getPestPredictions(farmPlanId: string, user: AuthenticatedUser) {
  const forecasts = await ensureForecast(farmPlanId, user);
  const predictions = buildPestPredictions(farmPlanId, forecasts);
  await replacePestPredictions(farmPlanId, predictions);
  return { predictions };
}

export async function getDiseasePredictions(farmPlanId: string, user: AuthenticatedUser) {
  const forecasts = await ensureForecast(farmPlanId, user);
  const predictions = buildDiseasePredictions(farmPlanId, forecasts);
  await replaceDiseasePredictions(farmPlanId, predictions);
  return { predictions };
}

export async function getStressPrediction(farmPlanId: string, user: AuthenticatedUser) {
  const forecasts = await ensureForecast(farmPlanId, user);
  const avgTemp = average(forecasts.map((item) => item.temperature));
  const avgHumidity = average(forecasts.map((item) => item.humidity));
  const rainfall = sum(forecasts.map((item) => item.rainfall));
  const waterStress = Math.max(0, Math.min(100, 70 - rainfall * 2 + (avgTemp > 33 ? 20 : 0)));
  const heatStress = Math.max(0, Math.min(100, avgTemp > 35 ? 85 : avgTemp > 32 ? 60 : 25));
  const nutrientStress = Math.max(10, Math.min(70, avgHumidity > 85 ? 45 : 25));
  const growthStress = Math.round((waterStress + heatStress + nutrientStress) / 3);
  return {
    stress: { waterStress, heatStress, nutrientStress, growthStress },
    recommendedActions: [
      waterStress > 60 ? 'Increase soil moisture checks and irrigate during cooler hours.' : 'Keep irrigation steady and avoid waterlogging.',
      heatStress > 60 ? 'Use mulching or shade support for sensitive crops.' : 'Continue routine canopy inspection.',
      avgHumidity > 80 ? 'Monitor fungal disease pressure every morning.' : 'Maintain normal disease scouting rhythm.',
    ],
  };
}

export async function getWaterPrediction(farmPlanId: string, user: AuthenticatedUser) {
  const { plan } = await getPlanLandAndCoordinates(farmPlanId, user);
  const forecasts = await ensureForecast(farmPlanId, user);
  const rainfall = sum(forecasts.slice(0, 3).map((item) => item.rainfall));
  const avgTemp = average(forecasts.slice(0, 3).map((item) => item.temperature));
  const baseNeed = Number((plan.waterRequirement as { estimatedLitresPerDay?: number })?.estimatedLitresPerDay ?? 2500);
  const adjustment = rainfall > 25 ? -0.45 : avgTemp > 34 ? 0.3 : 0;
  const waterNeededLitresPerDay = Math.max(0, Math.round(baseNeed * (1 + adjustment)));
  return {
    water: {
      waterNeededLitresPerDay,
      nextIrrigation: rainfall > 25 ? 'Skip irrigation for 24 to 48 hours and inspect soil moisture.' : 'Irrigate in the early morning or evening.',
      action: rainfall > 25 ? 'Reduce irrigation' : avgTemp > 34 ? 'Increase irrigation' : 'Maintain irrigation',
      rainfallNext3Days: rainfall,
    },
  };
}

export async function getFarmHealthForecast(farmPlanId: string, user: AuthenticatedUser) {
  const { plan } = await getPlanLandAndCoordinates(farmPlanId, user);
  const forecasts = await ensureForecast(farmPlanId, user);
  const base = Math.max(20, 100 - plan.riskScore);
  return {
    forecast: [3, 7, 14, 30].map((days) => {
      const slice = forecasts.slice(0, Math.min(forecasts.length, Math.ceil(days / 4)));
      const risk = calculateRiskScore(slice);
      return {
        days,
        expectedCropHealth: Math.max(0, Math.min(100, Math.round(base - risk * 0.25))),
        expectedRisk: riskLevel(risk),
        weatherImpact: summarizeWeather(slice),
        recommendations: buildInsights(farmPlanId, slice).slice(0, 3).map((item) => item.recommendation),
      };
    }),
  };
}

async function ensureForecast(farmPlanId: string, user: AuthenticatedUser) {
  const cached = await getCachedForecast(farmPlanId);
  if (cached) {
    await getOwnedFarmPlan(farmPlanId, user);
    return cached as unknown as WeatherForecast[];
  }
  const refreshed = await refreshWeather({ farmPlanId, force: true }, user);
  return refreshed.forecasts as unknown as WeatherForecast[];
}

async function generatePredictionsAndAlerts(farmPlanId: string, user: AuthenticatedUser, forecasts: WeatherForecast[]) {
  await Promise.all([
    replaceInsights(farmPlanId, buildInsights(farmPlanId, forecasts)),
    replacePestPredictions(farmPlanId, buildPestPredictions(farmPlanId, forecasts)),
    replaceDiseasePredictions(farmPlanId, buildDiseasePredictions(farmPlanId, forecasts)),
    replaceAlerts(farmPlanId, user.id, buildAlerts(farmPlanId, forecasts)),
  ]);
}

async function getPlanLandAndCoordinates(farmPlanId: string, user: AuthenticatedUser) {
  const plan = await getOwnedFarmPlan(farmPlanId, user);
  const land = await LandModel.findById(plan.landId).lean();
  if (!land) throw new AppError('Land not found for weather forecast.', 404);
  const coordinates = getCoordinates(land);
  return { plan, land, coordinates };
}

async function getOwnedFarmPlan(farmPlanId: string, user: AuthenticatedUser) {
  const plan = await FarmPlanModel.findById(farmPlanId).lean();
  if (!plan) throw new AppError('Farm plan not found.', 404);
  if (user.role !== 'admin' && String(plan.ownerId) !== user.id) throw new AppError('Farm plan not found.', 404);
  return plan;
}

function getCoordinates(land: { location?: { coordinates?: { coordinates?: number[] }; state?: string } }) {
  const coords = land.location?.coordinates?.coordinates;
  if (coords?.length === 2) return { longitude: coords[0], latitude: coords[1] };
  const byState: Record<string, { latitude: number; longitude: number }> = {
    Karnataka: { latitude: 12.9716, longitude: 77.5946 },
    Kerala: { latitude: 10.8505, longitude: 76.2711 },
    'Tamil Nadu': { latitude: 11.1271, longitude: 78.6569 },
  };
  return byState[land.location?.state ?? ''] ?? { latitude: 12.9716, longitude: 77.5946 };
}

function buildInsights(farmPlanId: string, forecasts: WeatherForecast[]) {
  const insights = [];
  const maxRain = Math.max(...forecasts.map((item) => item.rainfall));
  const maxTemp = Math.max(...forecasts.map((item) => item.temperature));
  const maxWind = Math.max(...forecasts.map((item) => item.windSpeed));
  const avgHumidity = average(forecasts.map((item) => item.humidity));
  if (maxRain >= 20) insights.push({ farmPlanId, title: 'High rain expected', category: 'Rain', priority: maxRain > 45 ? 'Critical' : 'High', description: `${maxRain} mm rainfall is expected in the forecast window.`, recommendation: 'Delay irrigation, clear drainage and avoid fertilizer application before rain.', riskScore: Math.min(100, maxRain * 2) });
  if (maxTemp >= 34) insights.push({ farmPlanId, title: 'Heat stress risk', category: 'Heat', priority: maxTemp > 38 ? 'Critical' : 'High', description: `Temperature may reach ${maxTemp}C.`, recommendation: 'Increase watering during cooler hours and use mulch for sensitive crops.', riskScore: Math.min(100, maxTemp * 2) });
  if (avgHumidity >= 80) insights.push({ farmPlanId, title: 'Disease risk high', category: 'Disease', priority: 'High', description: `Average humidity is ${Math.round(avgHumidity)}%.`, recommendation: 'Inspect leaves tomorrow morning and improve airflow around dense crop areas.', riskScore: Math.min(100, avgHumidity) });
  if (maxWind >= 35) insights.push({ farmPlanId, title: 'Strong wind expected', category: 'Wind', priority: 'Medium', description: `Wind speed may reach ${maxWind} km/h.`, recommendation: 'Support weak plants, secure shade nets and delay spraying during windy periods.', riskScore: Math.min(100, maxWind * 2) });
  if (!insights.length) insights.push({ farmPlanId, title: 'Weather looks manageable', category: 'General', priority: 'Low', description: 'No severe weather risk detected in the current forecast.', recommendation: 'Continue normal crop monitoring and keep the calendar updated.', riskScore: 20 });
  return insights;
}

function buildPestPredictions(farmPlanId: string, forecasts: WeatherForecast[]) {
  const humidity = average(forecasts.map((item) => item.humidity));
  const temp = average(forecasts.map((item) => item.temperature));
  return [
    pest(farmPlanId, 'Aphids', humidity > 70 && temp > 24 ? 'High' : 'Medium', 'Leaf curling, sticky residue and ant movement'),
    pest(farmPlanId, 'Whiteflies', temp > 28 ? 'High' : 'Low', 'White insects under leaves and yellowing'),
    pest(farmPlanId, 'Thrips', temp > 30 && humidity < 70 ? 'Medium' : 'Low', 'Silver streaks and flower damage'),
    pest(farmPlanId, 'Fruit Fly', humidity > 75 ? 'Medium' : 'Low', 'Puncture marks on fruit'),
  ];
}

function buildDiseasePredictions(farmPlanId: string, forecasts: WeatherForecast[]) {
  const humidity = average(forecasts.map((item) => item.humidity));
  const rainfall = sum(forecasts.map((item) => item.rainfall));
  return [
    disease(farmPlanId, 'Leaf Spot', humidity > 78 ? 'High' : 'Medium', ['High humidity', `${rainfall} mm rainfall forecast`]),
    disease(farmPlanId, 'Blight', rainfall > 35 ? 'High' : 'Low', ['Leaf wetness', 'Cloudy weather']),
    disease(farmPlanId, 'Powdery Mildew', humidity > 70 && rainfall < 15 ? 'Medium' : 'Low', ['Humid canopy', 'Limited rainfall']),
    disease(farmPlanId, 'Root Rot', rainfall > 45 ? 'High' : 'Low', ['Waterlogging risk']),
  ];
}

function buildAlerts(farmPlanId: string, forecasts: WeatherForecast[]) {
  return buildInsights(farmPlanId, forecasts)
    .filter((insight) => insight.priority !== 'Low')
    .map((insight) => ({ farmPlanId, title: insight.title, category: insight.category, priority: insight.priority, message: insight.description, recommendedAction: insight.recommendation, forecastDate: forecasts[0]?.forecastDate, isActive: true }));
}

async function replaceInsights(farmPlanId: string, insights: ReturnType<typeof buildInsights>) {
  await WeatherInsightModel.deleteMany({ farmPlanId });
  return WeatherInsightModel.insertMany(insights);
}

async function replacePestPredictions(farmPlanId: string, predictions: ReturnType<typeof buildPestPredictions>) {
  await PestPredictionModel.deleteMany({ farmPlanId });
  return PestPredictionModel.insertMany(predictions);
}

async function replaceDiseasePredictions(farmPlanId: string, predictions: ReturnType<typeof buildDiseasePredictions>) {
  await DiseasePredictionModel.deleteMany({ farmPlanId });
  return DiseasePredictionModel.insertMany(predictions);
}

async function replaceAlerts(farmPlanId: string, userId: string, alerts: ReturnType<typeof buildAlerts>) {
  await WeatherAlertModel.deleteMany({ farmPlanId });
  if (!alerts.length) return [];
  await Promise.all(alerts.filter((alert) => ['High', 'Critical'].includes(alert.priority)).map((alert) => NotificationModel.create({ userId, type: 'weather-alert', title: alert.title, message: alert.recommendedAction, data: { farmPlanId, category: alert.category } })));
  return WeatherAlertModel.insertMany(alerts);
}

function pest(farmPlanId: string, pestName: 'Aphids' | 'Whiteflies' | 'Thrips' | 'Fruit Fly', riskLevel: 'Low' | 'Medium' | 'High' | 'Critical', symptom: string) {
  return { farmPlanId, pestName, riskLevel, confidence: riskLevel === 'High' ? 82 : riskLevel === 'Medium' ? 68 : 52, symptomsToWatch: [symptom], earlyDetection: ['Inspect underside of leaves twice a week', 'Use yellow sticky traps where practical'], preventiveMeasures: ['Remove weeds near crop', 'Avoid excess nitrogen', 'Start monitoring before visible damage spreads'], estimatedDamage: riskLevel === 'High' ? 'Moderate to high yield loss if ignored' : 'Low to moderate if monitored early' };
}

function disease(farmPlanId: string, diseaseName: 'Leaf Spot' | 'Blight' | 'Powdery Mildew' | 'Root Rot', riskLevel: 'Low' | 'Medium' | 'High' | 'Critical', weatherFactors: string[]) {
  return { farmPlanId, diseaseName, riskLevel, confidence: riskLevel === 'High' ? 84 : riskLevel === 'Medium' ? 70 : 55, reasons: ['Current forecast increases preventive scouting priority'], weatherFactors, recommendedMonitoring: ['Inspect leaves early morning', 'Check lower canopy and soil moisture'], organicPrevention: ['Improve airflow', 'Use neem or biological controls where locally appropriate'], chemicalPrevention: ['Use registered fungicide only after field confirmation and label guidance'] };
}

function buildWeatherCharts(forecasts: WeatherForecast[]) {
  return forecasts.map((item) => ({ date: new Date(item.forecastDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), temperature: item.temperature, humidity: item.humidity, rainfall: item.rainfall, windSpeed: item.windSpeed, risk: calculateRiskScore([item]) }));
}

function buildRiskTrend(forecasts: WeatherForecast[]) {
  return forecasts.map((item) => ({ date: item.forecastDate, riskScore: calculateRiskScore([item]), riskLevel: riskLevel(calculateRiskScore([item])) }));
}

function summarizeWeather(forecasts: WeatherForecast[]) {
  return { averageTemperature: Math.round(average(forecasts.map((item) => item.temperature))), averageHumidity: Math.round(average(forecasts.map((item) => item.humidity))), totalRainfall: sum(forecasts.map((item) => item.rainfall)), maxWindSpeed: Math.max(...forecasts.map((item) => item.windSpeed)), riskScore: calculateRiskScore(forecasts), riskLevel: riskLevel(calculateRiskScore(forecasts)) };
}

function calculateRiskScore(forecasts: WeatherForecast[]) {
  if (!forecasts.length) return 0;
  const rain = Math.min(35, sum(forecasts.map((item) => item.rainfall)) * 0.8);
  const heat = Math.max(...forecasts.map((item) => item.temperature)) > 34 ? 25 : 5;
  const humidity = average(forecasts.map((item) => item.humidity)) > 80 ? 20 : 5;
  const wind = Math.max(...forecasts.map((item) => item.windSpeed)) > 35 ? 20 : 5;
  return Math.round(Math.min(100, rain + heat + humidity + wind));
}

function riskLevel(score: number) {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 35) return 'Medium';
  return 'Low';
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, item) => sum + item, 0) / values.length : 0;
}

function sum(values: number[]) {
  return values.reduce((total, item) => total + item, 0);
}

