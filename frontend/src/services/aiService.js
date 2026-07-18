import { apiClient } from '@/services/apiClient.js';

export async function analyzeLand(payload) {
  const response = await apiClient.post('/ai/land-analysis', payload);
  return response.data.data;
}

export async function getCropRecommendation(payload) {
  const response = await apiClient.post('/ai/crop-recommendation', payload);
  return response.data.data;
}

export async function getBusinessRecommendation(payload) {
  const response = await apiClient.post('/ai/business-recommendation', payload);
  return response.data.data;
}

export async function sendAIChat(payload) {
  const response = await apiClient.post('/ai/chat', payload);
  return response.data.data;
}

export async function getAIHistory(params = {}) {
  const response = await apiClient.get('/ai/history', { params });
  return response.data.data;
}

export async function getAIHistoryItem(id) {
  const response = await apiClient.get(`/ai/history/${id}`);
  return response.data.data;
}

export async function deleteAIHistory(id) {
  const response = await apiClient.delete(`/ai/history/${id}`);
  return response.data.data;
}
