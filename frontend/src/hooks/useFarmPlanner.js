import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as farmPlannerService from '@/services/farmPlannerService.js';

export const farmPlannerKeys = {
  all: ['farm-planner'],
  plans: (filters) => [...farmPlannerKeys.all, 'plans', filters],
  plan: (id) => [...farmPlannerKeys.all, 'plan', id],
  dashboard: (id) => [...farmPlannerKeys.all, 'dashboard', id],
};

export function useFarmPlans(filters) {
  return useQuery({ queryKey: farmPlannerKeys.plans(filters), queryFn: () => farmPlannerService.getFarmPlans(filters), retry: 1 });
}

export function useFarmPlan(id) {
  return useQuery({ queryKey: farmPlannerKeys.plan(id), queryFn: () => farmPlannerService.getFarmPlan(id), enabled: Boolean(id), retry: 1 });
}

export function useGeneratePlan() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: farmPlannerService.generateFarmPlan, retry: false, onSuccess: () => queryClient.invalidateQueries({ queryKey: farmPlannerKeys.all }) });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }) => farmPlannerService.updateFarmPlan(id, payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: farmPlannerKeys.all }) });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: farmPlannerService.deleteFarmPlan, onSuccess: () => queryClient.invalidateQueries({ queryKey: farmPlannerKeys.all }) });
}

export function useRecalculatePlan() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }) => farmPlannerService.recalculateFarmPlan(id, payload), retry: false, onSuccess: () => queryClient.invalidateQueries({ queryKey: farmPlannerKeys.all }) });
}

export function useFarmDashboard(id) {
  return useQuery({ queryKey: farmPlannerKeys.dashboard(id), queryFn: () => farmPlannerService.getFarmPlanDashboard(id), enabled: Boolean(id), retry: 1 });
}
