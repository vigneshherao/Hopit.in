import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as moderationService from '@/services/moderationService.js';

export const moderationKeys = {
  all: ['admin', 'moderation'],
  queue: (filters) => [...moderationKeys.all, 'queue', filters],
  detail: (id) => [...moderationKeys.all, 'detail', id],
};

export function useModerationQueue(filters = {}) {
  return useQuery({ queryKey: moderationKeys.queue(filters), queryFn: () => moderationService.getModerationQueue(filters), retry: 1 });
}

export function useModeration(id) {
  return useQuery({ queryKey: moderationKeys.detail(id), queryFn: () => moderationService.getModeration(id), enabled: Boolean(id), retry: 1 });
}

function useModerationMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: moderationKeys.all }),
  });
}

export function useAssignModerator() {
  return useModerationMutation(moderationService.assignModerator);
}

export function useReviewModeration() {
  return useModerationMutation(moderationService.reviewModeration);
}

export function useApproveListing() {
  return useModerationMutation(moderationService.approveListing);
}

export function useRejectListing() {
  return useModerationMutation(moderationService.rejectListing);
}

export function useRequestRevision() {
  return useModerationMutation(moderationService.requestRevision);
}

export function useEscalateListing() {
  return useModerationMutation(moderationService.escalateListing);
}

export function useFlagListing() {
  return useModerationMutation(moderationService.flagListing);
}
