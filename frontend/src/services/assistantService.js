import { apiClient } from '@/services/apiClient.js';

export async function chatWithAssistant(payload) {
  const response = await apiClient.post('/assistant/chat', payload);
  return response.data.data;
}

export async function analyzeFarm(payload) {
  const response = await apiClient.post('/assistant/analyze', payload);
  return response.data.data;
}

export async function getFarmInsights(farmPlanId) {
  const response = await apiClient.get(`/assistant/insights/${farmPlanId}`);
  return response.data.data;
}

export async function getFarmRecommendations(farmPlanId) {
  const response = await apiClient.get(`/assistant/recommendations/${farmPlanId}`);
  return response.data.data;
}

export async function getFarmForecast(farmPlanId) {
  const response = await apiClient.get(`/assistant/forecast/${farmPlanId}`);
  return response.data.data;
}

export async function generateFarmReport(payload) {
  const response = await apiClient.post('/assistant/generate-report', payload);
  return response.data.data;
}

export async function getAssistantConversations(params = {}) {
  const response = await apiClient.get('/assistant/conversations', { params });
  return response.data.data;
}

