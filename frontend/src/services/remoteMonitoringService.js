import { apiClient } from '@/services/apiClient.js';

export async function getMonitoringDashboard(farmPlanId) {
  const response = await apiClient.get(`/remote-monitoring/plans/${farmPlanId}/dashboard`);
  return response.data.data;
}

export async function getFarmBoundary(farmPlanId) {
  const response = await apiClient.get(`/remote-monitoring/plans/${farmPlanId}/boundary`);
  return response.data.data;
}

export async function createFarmBoundary(farmPlanId, payload) {
  const response = await apiClient.post(`/remote-monitoring/plans/${farmPlanId}/boundary`, payload);
  return response.data.data;
}

export async function getSatelliteScenes(farmPlanId) {
  const response = await apiClient.get(`/remote-monitoring/plans/${farmPlanId}/satellite/scenes`);
  return response.data.data;
}

export async function requestSatelliteScene(farmPlanId, payload) {
  const response = await apiClient.post(`/remote-monitoring/plans/${farmPlanId}/satellite/request`, payload);
  return response.data.data;
}

export async function getScenes(farmPlanId) {
  const response = await apiClient.get(`/remote-monitoring/plans/${farmPlanId}/scenes`);
  return response.data.data;
}

export async function getScene(sceneId) {
  const response = await apiClient.get(`/remote-monitoring/scenes/${sceneId}`);
  return response.data.data;
}

export async function getZones(farmPlanId) {
  const response = await apiClient.get(`/remote-monitoring/plans/${farmPlanId}/zones`);
  return response.data.data;
}

export async function reviewZone(zoneId) {
  const response = await apiClient.post(`/remote-monitoring/zones/${zoneId}/review`);
  return response.data.data;
}

export async function createZoneTask(zoneId, payload = {}) {
  const response = await apiClient.post(`/remote-monitoring/zones/${zoneId}/create-task`, payload);
  return response.data.data;
}

export async function resolveZone(zoneId) {
  const response = await apiClient.post(`/remote-monitoring/zones/${zoneId}/resolve`);
  return response.data.data;
}

export async function dismissZone(zoneId) {
  const response = await apiClient.post(`/remote-monitoring/zones/${zoneId}/dismiss`);
  return response.data.data;
}

export async function getObservations(farmPlanId) {
  const response = await apiClient.get(`/remote-monitoring/plans/${farmPlanId}/observations`);
  return response.data.data;
}

export async function createObservation(farmPlanId, payload) {
  const response = await apiClient.post(`/remote-monitoring/plans/${farmPlanId}/observations`, payload);
  return response.data.data;
}

export async function createComparison(farmPlanId, payload) {
  const response = await apiClient.post(`/remote-monitoring/plans/${farmPlanId}/comparisons`, payload);
  return response.data.data;
}

export async function getComparisons(farmPlanId) {
  const response = await apiClient.get(`/remote-monitoring/plans/${farmPlanId}/comparisons`);
  return response.data.data;
}

export async function getReports(farmPlanId) {
  const response = await apiClient.get(`/remote-monitoring/plans/${farmPlanId}/reports`);
  return response.data.data;
}

export async function generateReport(farmPlanId, payload) {
  const response = await apiClient.post(`/remote-monitoring/plans/${farmPlanId}/reports`, payload);
  return response.data.data;
}

export async function getDroneSurveys(farmPlanId) {
  const response = await apiClient.get(`/remote-monitoring/plans/${farmPlanId}/drone-surveys`);
  return response.data.data;
}

export async function createDroneSurvey(farmPlanId, payload) {
  const response = await apiClient.post(`/remote-monitoring/plans/${farmPlanId}/drone-surveys`, payload);
  return response.data.data;
}

