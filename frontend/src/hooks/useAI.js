import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as aiService from '@/services/aiService.js';

export const aiKeys = {
  all: ['ai'],
  history: (filters) => [...aiKeys.all, 'history', filters],
  item: (id) => [...aiKeys.all, 'history-item', id],
};

export function useAnalyzeLand() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: aiService.analyzeLand, retry: false, onSuccess: () => queryClient.invalidateQueries({ queryKey: aiKeys.all }) });
}

export function useCropRecommendation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: aiService.getCropRecommendation, retry: false, onSuccess: () => queryClient.invalidateQueries({ queryKey: aiKeys.all }) });
}

export function useBusinessRecommendation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: aiService.getBusinessRecommendation, retry: false, onSuccess: () => queryClient.invalidateQueries({ queryKey: aiKeys.all }) });
}

export function useAIChat() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: aiService.sendAIChat, retry: false, onSuccess: () => queryClient.invalidateQueries({ queryKey: aiKeys.all }) });
}

export function useAIHistory(filters) {
  return useQuery({ queryKey: aiKeys.history(filters), queryFn: () => aiService.getAIHistory(filters), retry: 1 });
}

export function useAIHistoryItem(id) {
  return useQuery({ queryKey: aiKeys.item(id), queryFn: () => aiService.getAIHistoryItem(id), enabled: Boolean(id), retry: 1 });
}

export function useDeleteAIHistory() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: aiService.deleteAIHistory, onSuccess: () => queryClient.invalidateQueries({ queryKey: aiKeys.all }) });
}
