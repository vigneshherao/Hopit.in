import { apiClient } from '@/services/apiClient.js';

export async function createApplication(payload) {
  const response = await apiClient.post('/applications', payload);
  return response.data.data;
}

export async function updateApplication(id, payload) {
  const response = await apiClient.patch(`/applications/${id}`, payload);
  return response.data.data;
}

export async function submitApplication(id) {
  const response = await apiClient.post(`/applications/${id}/submit`);
  return response.data.data;
}

export async function getMyApplications(params = {}) {
  const response = await apiClient.get('/applications/my', { params });
  return response.data.data;
}

export async function getReceivedApplications(params = {}) {
  const response = await apiClient.get('/applications/received', { params });
  return response.data.data;
}

export async function getApplication(id) {
  const response = await apiClient.get(`/applications/${id}`);
  return response.data.data;
}

export async function withdrawApplication(id) {
  const response = await apiClient.post(`/applications/${id}/withdraw`);
  return response.data.data;
}

export async function reviewApplication(id) {
  const response = await apiClient.post(`/applications/${id}/review`);
  return response.data.data;
}

export async function shortlistApplication(id) {
  const response = await apiClient.post(`/applications/${id}/shortlist`);
  return response.data.data;
}

export async function rejectApplication(id, reason) {
  const response = await apiClient.post(`/applications/${id}/reject`, { reason });
  return response.data.data;
}

export async function requestApplicationChanges(id, message) {
  const response = await apiClient.post(`/applications/${id}/request-changes`, { message });
  return response.data.data;
}

export async function negotiateApplication(id, payload) {
  const response = await apiClient.post(`/applications/${id}/negotiate`, payload);
  return response.data.data;
}

export async function acceptNegotiatedTerms(id) {
  const response = await apiClient.post(`/applications/${id}/accept-terms`);
  return response.data.data;
}

export async function acceptApplication(id) {
  const response = await apiClient.post(`/applications/${id}/accept`);
  return response.data.data;
}

export async function cancelApplication(id, reason) {
  const response = await apiClient.post(`/applications/${id}/cancel`, { reason });
  return response.data.data;
}

export async function getApplicationStatistics() {
  const response = await apiClient.get('/applications/statistics');
  return response.data.data;
}

export async function uploadApplicationDocuments(files) {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('files', file));
  const response = await apiClient.post('/applications/upload/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data.uploads;
}

export async function getAgreement(id) {
  const response = await apiClient.get(`/agreements/${id}`);
  return response.data.data;
}

export async function requestAgreementChanges(id, message) {
  const response = await apiClient.post(`/agreements/${id}/request-changes`, { message });
  return response.data.data;
}

export async function confirmAgreement(id) {
  const response = await apiClient.post(`/agreements/${id}/legal-review`);
  return response.data.data;
}
