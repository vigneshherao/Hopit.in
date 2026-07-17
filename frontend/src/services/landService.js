import { apiClient } from '@/services/apiClient.js';

export async function getLands(params = {}) {
  const response = await apiClient.get('/lands', { params });
  return response.data.data;
}

export async function getLand(identifier) {
  const viewKey = sessionStorage.getItem(`hopit-land-view-${identifier}`);
  const response = await apiClient.get(`/lands/${identifier}`, {
    headers: viewKey ? { 'x-hopit-view-key': viewKey } : {},
  });
  sessionStorage.setItem(`hopit-land-view-${identifier}`, String(Date.now()));
  return response.data.data;
}

export async function getMyLands(params = {}) {
  const response = await apiClient.get('/lands/my/listings', { params });
  return response.data.data;
}

export async function getLandStatistics() {
  const response = await apiClient.get('/lands/my/statistics');
  return response.data.data;
}

export async function createLand(payload) {
  const response = await apiClient.post('/lands', payload);
  return response.data.data;
}

export async function updateLand(id, payload) {
  const response = await apiClient.patch(`/lands/${id}`, payload);
  return response.data.data;
}

export async function deleteLand(id) {
  const response = await apiClient.delete(`/lands/${id}`);
  return response.data.data;
}

export async function submitLandVerification(id) {
  const response = await apiClient.post(`/lands/${id}/submit-verification`);
  return response.data.data;
}

export async function updateLandStatus(id, action) {
  const response = await apiClient.patch(`/lands/${id}/status`, { action });
  return response.data.data;
}

export async function verifyLand(id, payload) {
  const response = await apiClient.patch(`/lands/${id}/verification`, payload);
  return response.data.data;
}

export async function uploadLandFiles(files, kind) {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('files', file));
  const response = await apiClient.post(`/lands/upload/${kind}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data.uploads;
}

export async function removeUpload(url) {
  const response = await apiClient.delete('/lands/upload', { data: { url } });
  return response.data;
}
