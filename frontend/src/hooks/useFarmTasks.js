import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as farmTaskService from '@/services/farmTaskService.js';

export const farmTaskKeys = {
  all: ['farm-tasks'],
  tasks: (filters) => [...farmTaskKeys.all, 'tasks', filters],
  planTasks: (planId) => [...farmTaskKeys.all, 'plan-tasks', planId],
  task: (id) => [...farmTaskKeys.all, 'task', id],
  calendar: (filters) => [...farmTaskKeys.all, 'calendar', filters],
  planCalendar: (planId) => [...farmTaskKeys.all, 'plan-calendar', planId],
};

export function useFarmTasks(filters) {
  return useQuery({ queryKey: farmTaskKeys.tasks(filters), queryFn: () => farmTaskService.getFarmTasks(filters), retry: 1 });
}

export function useTaskBoard(planId) {
  return useQuery({ queryKey: farmTaskKeys.planTasks(planId), queryFn: () => farmTaskService.getPlanTasks(planId), enabled: Boolean(planId), retry: 1 });
}

export function useFarmTask(id) {
  return useQuery({ queryKey: farmTaskKeys.task(id), queryFn: () => farmTaskService.getFarmTask(id), enabled: Boolean(id), retry: 1 });
}

export function useFarmCalendar(planId) {
  return useQuery({ queryKey: farmTaskKeys.planCalendar(planId), queryFn: () => farmTaskService.getPlanCalendar(planId), enabled: Boolean(planId), retry: 1 });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: farmTaskService.createFarmTask, onSuccess: () => queryClient.invalidateQueries({ queryKey: farmTaskKeys.all }) });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => farmTaskService.updateFarmTask(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: farmTaskKeys.all }),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: farmTaskService.deleteFarmTask, onSuccess: () => queryClient.invalidateQueries({ queryKey: farmTaskKeys.all }) });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: farmTaskService.completeFarmTask, onSuccess: () => queryClient.invalidateQueries({ queryKey: farmTaskKeys.all }) });
}

export function useStartTask() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: farmTaskService.startFarmTask, onSuccess: () => queryClient.invalidateQueries({ queryKey: farmTaskKeys.all }) });
}

export function useCancelTask() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: farmTaskService.cancelFarmTask, onSuccess: () => queryClient.invalidateQueries({ queryKey: farmTaskKeys.all }) });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }) => farmTaskService.updateCalendarEvent(id, payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: farmTaskKeys.all }) });
}
