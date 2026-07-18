import { apiClient } from '@/services/apiClient.js';

export async function getFarmPlans(params = {}) {
  const response = await apiClient.get('/farm-planner/plans', { params });
  return response.data.data;
}

export async function getFarmPlan(id) {
  const response = await apiClient.get(`/farm-planner/plans/${id}`);
  return response.data.data;
}

export async function generateFarmPlan(payload) {
  const response = await apiClient.post('/farm-planner/generate-plan', payload);
  return response.data.data;
}

export async function updateFarmPlan(id, payload) {
  const response = await apiClient.patch(`/farm-planner/plans/${id}`, payload);
  return response.data.data;
}

export async function deleteFarmPlan(id) {
  const response = await apiClient.delete(`/farm-planner/plans/${id}`);
  return response.data.data;
}

export async function recalculateFarmPlan(id, payload = {}) {
  const response = await apiClient.post(`/farm-planner/plans/${id}/recalculate`, payload);
  return response.data.data;
}

export async function getFarmPlanDashboard(id) {
  const response = await apiClient.get(`/farm-planner/plans/${id}/dashboard`);
  return response.data.data;
}
