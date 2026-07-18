import { apiClient } from '@/services/apiClient.js';

export async function getNotifications(params = {}) {
  const { data } = await apiClient.get('/notifications', { params });
  return data.data;
}

export async function getUnreadNotifications() {
  const { data } = await apiClient.get('/notifications/unread');
  return data.data;
}

export async function getNotificationPreferences() {
  const { data } = await apiClient.get('/notifications/preferences');
  return data.data;
}

export async function updateNotificationPreferences(payload) {
  const { data } = await apiClient.patch('/notifications/preferences', payload);
  return data.data;
}

export async function readNotification(id) {
  const { data } = await apiClient.patch(`/notifications/${id}/read`);
  return data.data;
}

export async function readAllNotifications() {
  const { data } = await apiClient.patch('/notifications/read-all');
  return data.data;
}

export async function deleteNotification(id) {
  const { data } = await apiClient.delete(`/notifications/${id}`);
  return data.data;
}

export async function clearNotifications() {
  const { data } = await apiClient.delete('/notifications/clear');
  return data.data;
}

export async function getActivities(params = {}) {
  const { data } = await apiClient.get('/activity', { params });
  return data.data;
}

export async function getPresence(userId) {
  const { data } = await apiClient.get(`/presence/${userId}`);
  return data.data;
}
