import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as realtimeService from '@/services/realtimeService.js';

export const realtimeKeys = {
  notifications: (params = {}) => ['notifications', params],
  unread: ['notifications', 'unread'],
  preferences: ['notifications', 'preferences'],
  activities: (params = {}) => ['activity', params],
  presence: (userId) => ['presence', userId],
};

export function useNotifications(params = {}) {
  return useQuery({ queryKey: realtimeKeys.notifications(params), queryFn: () => realtimeService.getNotifications(params), staleTime: 30_000 });
}

export function useUnreadNotifications() {
  return useQuery({ queryKey: realtimeKeys.unread, queryFn: realtimeService.getUnreadNotifications, staleTime: 15_000 });
}

export function useNotificationPreferences() {
  return useQuery({ queryKey: realtimeKeys.preferences, queryFn: realtimeService.getNotificationPreferences });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: realtimeService.updateNotificationPreferences,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: realtimeKeys.preferences }),
  });
}

export function useReadNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: realtimeService.readNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useReadAllNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: realtimeService.readAllNotifications,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: realtimeService.deleteNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useActivities(params = {}) {
  return useQuery({ queryKey: realtimeKeys.activities(params), queryFn: () => realtimeService.getActivities(params), staleTime: 30_000 });
}

export function usePresence(userId) {
  return useQuery({ queryKey: realtimeKeys.presence(userId), queryFn: () => realtimeService.getPresence(userId), enabled: Boolean(userId), staleTime: 30_000 });
}
