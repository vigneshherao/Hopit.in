import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as assistantService from '@/services/assistantService.js';

export const assistantKeys = {
  all: ['assistant'],
  conversations: (filters) => [...assistantKeys.all, 'conversations', filters],
  insights: (farmPlanId) => [...assistantKeys.all, 'insights', farmPlanId],
  recommendations: (farmPlanId) => [...assistantKeys.all, 'recommendations', farmPlanId],
  forecast: (farmPlanId) => [...assistantKeys.all, 'forecast', farmPlanId],
  health: (farmPlanId) => [...assistantKeys.all, 'health', farmPlanId],
};

export function useAssistant(filters) {
  return useQuery({ queryKey: assistantKeys.conversations(filters), queryFn: () => assistantService.getAssistantConversations(filters), retry: 1 });
}

export function useAssistantChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assistantService.chatWithAssistant,
    retry: false,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: assistantKeys.conversations({}) });
      queryClient.invalidateQueries({ queryKey: assistantKeys.health(variables.farmPlanId) });
    },
  });
}

export function useAnalyzeFarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assistantService.analyzeFarm,
    retry: false,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: assistantKeys.insights(variables.farmPlanId) });
      queryClient.invalidateQueries({ queryKey: assistantKeys.recommendations(variables.farmPlanId) });
    },
  });
}

export function useFarmInsights(farmPlanId) {
  return useQuery({ queryKey: assistantKeys.insights(farmPlanId), queryFn: () => assistantService.getFarmInsights(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}

export function useFarmRecommendations(farmPlanId) {
  return useQuery({ queryKey: assistantKeys.recommendations(farmPlanId), queryFn: () => assistantService.getFarmRecommendations(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}

export function useForecast(farmPlanId) {
  return useQuery({ queryKey: assistantKeys.forecast(farmPlanId), queryFn: () => assistantService.getFarmForecast(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}

export function useGenerateReport() {
  return useMutation({ mutationFn: assistantService.generateFarmReport, retry: false });
}

export function useFarmHealth(farmPlanId) {
  return useFarmInsights(farmPlanId);
}

