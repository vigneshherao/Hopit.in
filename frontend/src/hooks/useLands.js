import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as landService from '@/services/landService.js';

export const landKeys = {
  all: ['lands'],
  lists: () => [...landKeys.all, 'list'],
  list: (filters) => [...landKeys.lists(), filters],
  detail: (identifier) => [...landKeys.all, 'detail', identifier],
  my: (filters) => [...landKeys.all, 'my', filters],
  statistics: () => [...landKeys.all, 'statistics'],
};

export function useLands(filters) {
  return useQuery({
    queryKey: landKeys.list(filters),
    queryFn: () => landService.getLands(filters),
  });
}

export function useLand(identifier) {
  return useQuery({
    queryKey: landKeys.detail(identifier),
    queryFn: () => landService.getLand(identifier),
    enabled: Boolean(identifier),
  });
}

export function useMyLands(filters) {
  return useQuery({
    queryKey: landKeys.my(filters),
    queryFn: () => landService.getMyLands(filters),
  });
}

export function useLandStatistics() {
  return useQuery({
    queryKey: landKeys.statistics(),
    queryFn: landService.getLandStatistics,
  });
}

export function useCreateLand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: landService.createLand,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: landKeys.all }),
  });
}

export function useUpdateLand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => landService.updateLand(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: landKeys.all }),
  });
}

export function useDeleteLand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: landService.deleteLand,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: landKeys.all }),
  });
}

export function useSubmitLandVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: landService.submitLandVerification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: landKeys.all }),
  });
}

export function useUpdateLandStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }) => landService.updateLandStatus(id, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: landKeys.all }),
  });
}

export function useVerifyLand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => landService.verifyLand(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: landKeys.all }),
  });
}
