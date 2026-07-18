import { apiClient } from '@/services/apiClient.js';

export async function getModerationQueue(params = {}) {
  const response = await apiClient.get('/admin/moderation/queue', { params });
  return response.data.data;
}

export async function getModeration(id) {
  const response = await apiClient.get(`/admin/moderation/${id}`);
  return response.data.data;
}

export async function assignModerator(payload) {
  const response = await apiClient.post('/admin/moderation/assign', payload);
  return response.data.data;
}

export async function reviewModeration(payload) {
  const response = await apiClient.post('/admin/moderation/review', payload);
  return response.data.data;
}

export async function approveListing(payload) {
  const response = await apiClient.post('/admin/moderation/approve', payload);
  return response.data.data;
}

export async function rejectListing(payload) {
  const response = await apiClient.post('/admin/moderation/reject', payload);
  return response.data.data;
}

export async function requestRevision(payload) {
  const response = await apiClient.post('/admin/moderation/revision', payload);
  return response.data.data;
}

export async function escalateListing(payload) {
  const response = await apiClient.post('/admin/moderation/escalate', payload);
  return response.data.data;
}

export async function flagListing(payload) {
  const response = await apiClient.post('/admin/moderation/flags', payload);
  return response.data.data;
}
