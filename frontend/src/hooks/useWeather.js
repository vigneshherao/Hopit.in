import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as weatherService from '@/services/weatherService.js';

export const weatherKeys = {
  all: ['weather'],
  current: (id) => [...weatherKeys.all, 'current', id],
  forecast: (id) => [...weatherKeys.all, 'forecast', id],
  insights: (id) => [...weatherKeys.all, 'insights', id],
  alerts: (id) => [...weatherKeys.all, 'alerts', id],
  pests: (id) => [...weatherKeys.all, 'pests', id],
  diseases: (id) => [...weatherKeys.all, 'diseases', id],
  stress: (id) => [...weatherKeys.all, 'stress', id],
  water: (id) => [...weatherKeys.all, 'water', id],
  farmHealth: (id) => [...weatherKeys.all, 'farm-health', id],
};

export function useCurrentWeather(farmPlanId) {
  return useQuery({ queryKey: weatherKeys.current(farmPlanId), queryFn: () => weatherService.getCurrentWeather(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}

export function useWeatherForecast(farmPlanId) {
  return useQuery({ queryKey: weatherKeys.forecast(farmPlanId), queryFn: () => weatherService.getWeatherForecast(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}

export function useWeatherInsights(farmPlanId) {
  return useQuery({ queryKey: weatherKeys.insights(farmPlanId), queryFn: () => weatherService.getWeatherInsights(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}

export function useWeatherAlerts(farmPlanId) {
  return useQuery({ queryKey: weatherKeys.alerts(farmPlanId), queryFn: () => weatherService.getWeatherAlerts(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}

export function useRefreshWeather() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: weatherService.refreshWeather, onSuccess: () => queryClient.invalidateQueries({ queryKey: weatherKeys.all }) });
}

export function usePestPrediction(farmPlanId) {
  return useQuery({ queryKey: weatherKeys.pests(farmPlanId), queryFn: () => weatherService.getPestPrediction(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}

export function useDiseasePrediction(farmPlanId) {
  return useQuery({ queryKey: weatherKeys.diseases(farmPlanId), queryFn: () => weatherService.getDiseasePrediction(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}

export function useStressPrediction(farmPlanId) {
  return useQuery({ queryKey: weatherKeys.stress(farmPlanId), queryFn: () => weatherService.getStressPrediction(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}

export function useWaterPrediction(farmPlanId) {
  return useQuery({ queryKey: weatherKeys.water(farmPlanId), queryFn: () => weatherService.getWaterPrediction(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}

export function useFarmHealthForecast(farmPlanId) {
  return useQuery({ queryKey: weatherKeys.farmHealth(farmPlanId), queryFn: () => weatherService.getFarmHealthForecast(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}

