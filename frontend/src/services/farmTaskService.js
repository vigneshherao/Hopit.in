import { apiClient } from '@/services/apiClient.js';

export async function getFarmTasks(params = {}) {
  const response = await apiClient.get('/farm-planner/tasks', { params });
  return response.data.data;
}

export async function getPlanTasks(planId) {
  const response = await apiClient.get(`/farm-planner/plans/${planId}/tasks`);
  return response.data.data;
}

export async function getFarmTask(id) {
  const response = await apiClient.get(`/farm-planner/tasks/${id}`);
  return response.data.data;
}

export async function createFarmTask(payload) {
  const response = await apiClient.post('/farm-planner/tasks', payload);
  return response.data.data;
}

export async function updateFarmTask(id, payload) {
  const response = await apiClient.patch(`/farm-planner/tasks/${id}`, payload);
  return response.data.data;
}

export async function deleteFarmTask(id) {
  const response = await apiClient.delete(`/farm-planner/tasks/${id}`);
  return response.data.data;
}

export async function completeFarmTask(id) {
  const response = await apiClient.post(`/farm-planner/tasks/${id}/complete`);
  return response.data.data;
}

export async function startFarmTask(id) {
  const response = await apiClient.post(`/farm-planner/tasks/${id}/start`);
  return response.data.data;
}

export async function cancelFarmTask(id) {
  const response = await apiClient.post(`/farm-planner/tasks/${id}/cancel`);
  return response.data.data;
}

export async function reassignFarmTask(id, payload) {
  const response = await apiClient.post(`/farm-planner/tasks/${id}/reassign`, payload);
  return response.data.data;
}

export async function getFarmCalendar(params = {}) {
  const response = await apiClient.get('/farm-calendar', { params });
  return response.data.data;
}

export async function getPlanCalendar(planId) {
  const response = await apiClient.get(`/farm-calendar/plans/${planId}/calendar`);
  return response.data.data;
}

export async function createCalendarEvent(payload) {
  const response = await apiClient.post('/farm-calendar', payload);
  return response.data.data;
}

export async function updateCalendarEvent(id, payload) {
  const response = await apiClient.patch(`/farm-calendar/${id}`, payload);
  return response.data.data;
}

export async function deleteCalendarEvent(id) {
  const response = await apiClient.delete(`/farm-calendar/${id}`);
  return response.data.data;
}
