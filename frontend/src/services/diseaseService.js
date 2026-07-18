import { apiClient } from '@/services/apiClient.js';

export async function analyzeDisease({ images, ...payload }) {
  const formData = new FormData();
  images.forEach((image) => formData.append('images', image));
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') formData.append(key, value);
  });
  const endpoint = images.length > 1 ? '/disease/analyze-multiple' : '/disease/analyze';
  const response = await apiClient.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return response.data.data;
}

export async function getDiseaseHistory(params = {}) {
  const response = await apiClient.get('/disease/history', { params });
  return response.data.data;
}

export async function getDiseaseAnalysis(id) {
  const response = await apiClient.get(`/disease/history/${id}`);
  return response.data.data;
}

export async function deleteDiseaseAnalysis(id) {
  const response = await apiClient.delete(`/disease/history/${id}`);
  return response.data.data;
}

export async function getDiseaseStatistics() {
  const response = await apiClient.get('/disease/statistics');
  return response.data.data;
}

export async function getLatestDiseaseAnalysis() {
  const response = await apiClient.get('/disease/latest');
  return response.data.data;
}

export async function getFarmDiseaseHistory(farmPlanId) {
  const response = await apiClient.get(`/disease/farm/${farmPlanId}`);
  return response.data.data;
}

