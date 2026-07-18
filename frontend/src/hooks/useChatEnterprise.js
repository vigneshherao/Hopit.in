import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as enterpriseService from '@/services/chatEnterpriseService.js';

export const chatEnterpriseKeys = {
  all: ['chat-enterprise'],
  workspace: (conversationId) => ['chat-enterprise', 'workspace', conversationId],
  timeline: (filters = {}) => ['chat-enterprise', 'timeline', filters],
  analytics: (conversationId) => ['chat-enterprise', 'analytics', conversationId],
  analyticsDashboard: ['chat-enterprise', 'analytics-dashboard'],
  reports: (filters = {}) => ['chat-enterprise', 'reports', filters],
  auditLogs: (filters = {}) => ['chat-enterprise', 'audit-logs', filters],
  digest: ['chat-enterprise', 'digest'],
};

export function useTeamWorkspace(conversationId) {
  return useQuery({ queryKey: chatEnterpriseKeys.workspace(conversationId), queryFn: () => enterpriseService.getTeamWorkspace(conversationId), enabled: Boolean(conversationId), staleTime: 30_000 });
}

export function useConversationTimeline(filters = {}) {
  return useQuery({ queryKey: chatEnterpriseKeys.timeline(filters), queryFn: () => enterpriseService.getConversationTimeline(filters), enabled: Boolean(filters?.conversationId) });
}

export function useConversationAnalytics(conversationId) {
  return useQuery({ queryKey: chatEnterpriseKeys.analytics(conversationId), queryFn: () => enterpriseService.getConversationAnalytics(conversationId), enabled: Boolean(conversationId), staleTime: 30_000 });
}

export function useAnalyticsDashboard() {
  return useQuery({ queryKey: chatEnterpriseKeys.analyticsDashboard, queryFn: enterpriseService.getAnalyticsDashboard, staleTime: 30_000 });
}

export function useReports(filters = {}) {
  return useQuery({ queryKey: chatEnterpriseKeys.reports(filters), queryFn: () => enterpriseService.getReports(filters) });
}

export function useModeration() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: enterpriseService.moderateReport, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatEnterpriseKeys.all }) });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: enterpriseService.createReport, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatEnterpriseKeys.all }) });
}

export function useAuditLogs(filters = {}) {
  return useQuery({ queryKey: chatEnterpriseKeys.auditLogs(filters), queryFn: () => enterpriseService.getAuditLogs(filters) });
}

export function useNotificationDigest() {
  return useQuery({ queryKey: chatEnterpriseKeys.digest, queryFn: enterpriseService.getNotificationDigest });
}

export function useUpdateNotificationDigest() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: enterpriseService.updateNotificationDigest, onSuccess: () => queryClient.invalidateQueries({ queryKey: chatEnterpriseKeys.digest }) });
}
