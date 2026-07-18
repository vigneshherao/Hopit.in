import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as diseaseService from '@/services/diseaseService.js';

export const diseaseKeys = {
  all: ['disease'],
  history: (filters) => [...diseaseKeys.all, 'history', filters],
  analysis: (id) => [...diseaseKeys.all, 'analysis', id],
  statistics: () => [...diseaseKeys.all, 'statistics'],
  latest: () => [...diseaseKeys.all, 'latest'],
  farm: (farmPlanId) => [...diseaseKeys.all, 'farm', farmPlanId],
};

export function useDiseaseHistory(filters) {
  return useQuery({ queryKey: diseaseKeys.history(filters), queryFn: () => diseaseService.getDiseaseHistory(filters), retry: 1 });
}

export function useDiseaseAnalysis(id) {
  return useQuery({ queryKey: diseaseKeys.analysis(id), queryFn: () => diseaseService.getDiseaseAnalysis(id), enabled: Boolean(id), retry: 1 });
}

export function useAnalyzeDisease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: diseaseService.analyzeDisease,
    retry: false,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: diseaseKeys.all });
      if (variables.farmPlanId) queryClient.invalidateQueries({ queryKey: diseaseKeys.farm(variables.farmPlanId) });
    },
  });
}

export function useDeleteAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: diseaseService.deleteDiseaseAnalysis, onSuccess: () => queryClient.invalidateQueries({ queryKey: diseaseKeys.all }) });
}

export function useDiseaseStatistics() {
  return useQuery({ queryKey: diseaseKeys.statistics(), queryFn: diseaseService.getDiseaseStatistics, retry: 1 });
}

export function useFarmDiseaseHistory(farmPlanId) {
  return useQuery({ queryKey: diseaseKeys.farm(farmPlanId), queryFn: () => diseaseService.getFarmDiseaseHistory(farmPlanId), enabled: Boolean(farmPlanId), retry: 1 });
}

