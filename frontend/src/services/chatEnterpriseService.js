import { apiClient } from '@/services/apiClient.js';

export async function getTeamWorkspace(conversationId) {
  const { data } = await apiClient.get(`/chat/workspace/${conversationId}`);
  return data.data;
}

export async function getConversationTimeline(params) {
  const { data } = await apiClient.get('/chat/timeline', { params });
  return data.data;
}

export async function getConversationAnalytics(conversationId) {
  const { data } = await apiClient.get(`/chat/analytics/${conversationId}`);
  return data.data;
}

export async function getAnalyticsDashboard() {
  const { data } = await apiClient.get('/chat/analytics');
  return data.data;
}

export async function createReport(payload) {
  const { data } = await apiClient.post('/chat/reports', payload);
  return data.data;
}

export async function getReports(params = {}) {
  const { data } = await apiClient.get('/chat/reports', { params });
  return data.data;
}

export async function moderateReport({ reportId, payload }) {
  const { data } = await apiClient.patch(`/chat/reports/${reportId}/moderation`, payload);
  return data.data;
}

export async function getAuditLogs(params = {}) {
  const { data } = await apiClient.get('/chat/audit-logs', { params });
  return data.data;
}

export async function getNotificationDigest() {
  const { data } = await apiClient.get('/chat/notification-digest');
  return data.data;
}

export async function updateNotificationDigest(payload) {
  const { data } = await apiClient.patch('/chat/notification-digest', payload);
  return data.data;
}
