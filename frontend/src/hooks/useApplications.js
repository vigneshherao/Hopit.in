import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as applicationService from '@/services/applicationService.js';

export const applicationKeys = {
  all: ['applications'],
  my: (filters) => [...applicationKeys.all, 'my', filters],
  received: (filters) => [...applicationKeys.all, 'received', filters],
  detail: (id) => [...applicationKeys.all, 'detail', id],
  statistics: () => [...applicationKeys.all, 'statistics'],
  agreement: (id) => ['agreements', id],
};

function invalidate(queryClient) {
  queryClient.invalidateQueries({ queryKey: applicationKeys.all });
  queryClient.invalidateQueries({ queryKey: ['agreements'] });
  queryClient.invalidateQueries({ queryKey: ['lands'] });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: applicationService.createApplication, onSuccess: () => invalidate(queryClient) });
}
export function useUpdateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => applicationService.updateApplication(id, payload),
    onSuccess: () => invalidate(queryClient),
  });
}
export function useSubmitApplication() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: applicationService.submitApplication, onSuccess: () => invalidate(queryClient) });
}
export function useMyApplications(filters) {
  return useQuery({ queryKey: applicationKeys.my(filters), queryFn: () => applicationService.getMyApplications(filters) });
}
export function useReceivedApplications(filters) {
  return useQuery({
    queryKey: applicationKeys.received(filters),
    queryFn: () => applicationService.getReceivedApplications(filters),
  });
}
export function useApplication(id) {
  return useQuery({ queryKey: applicationKeys.detail(id), queryFn: () => applicationService.getApplication(id), enabled: Boolean(id) });
}
export function useApplicationStatistics() {
  return useQuery({ queryKey: applicationKeys.statistics(), queryFn: applicationService.getApplicationStatistics });
}
function mutation(name) {
  return function useNamedMutation() {
    const queryClient = useQueryClient();
    return useMutation({ mutationFn: applicationService[name], onSuccess: () => invalidate(queryClient) });
  };
}
export const useWithdrawApplication = mutation('withdrawApplication');
export const useReviewApplication = mutation('reviewApplication');
export const useShortlistApplication = mutation('shortlistApplication');
export const useAcceptNegotiatedTerms = mutation('acceptNegotiatedTerms');
export const useAcceptApplication = mutation('acceptApplication');

export function useRejectApplication() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, reason }) => applicationService.rejectApplication(id, reason), onSuccess: () => invalidate(queryClient) });
}
export function useRequestApplicationChanges() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, message }) => applicationService.requestApplicationChanges(id, message), onSuccess: () => invalidate(queryClient) });
}
export function useNegotiateApplication() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }) => applicationService.negotiateApplication(id, payload), onSuccess: () => invalidate(queryClient) });
}
export function useCancelApplication() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, reason }) => applicationService.cancelApplication(id, reason), onSuccess: () => invalidate(queryClient) });
}
export function useAgreement(id) {
  return useQuery({ queryKey: applicationKeys.agreement(id), queryFn: () => applicationService.getAgreement(id), enabled: Boolean(id) });
}
export function useRequestAgreementChanges() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, message }) => applicationService.requestAgreementChanges(id, message), onSuccess: () => invalidate(queryClient) });
}
export function useConfirmAgreement() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: applicationService.confirmAgreement, onSuccess: () => invalidate(queryClient) });
}
