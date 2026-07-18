import { apiClient } from '@/services/apiClient.js';

export async function getWorkers(params = {}) {
  const response = await apiClient.get('/workers', { params });
  return response.data.data;
}

export async function getWorker(identifier) {
  const response = await apiClient.get(`/workers/${identifier}`);
  return response.data.data;
}

export async function getMyWorkerProfile() {
  const response = await apiClient.get('/workers/profile/me');
  return response.data.data;
}

export async function createWorkerProfile(payload) {
  const response = await apiClient.post('/workers/profile', payload);
  return response.data.data;
}

export async function updateWorkerProfile(payload) {
  const response = await apiClient.patch('/workers/profile/me', payload);
  return response.data.data;
}

export async function submitWorkerVerification() {
  const response = await apiClient.post('/workers/profile/submit-verification');
  return response.data.data;
}

export async function getWorkerStatistics() {
  const response = await apiClient.get('/workers/profile/statistics');
  return response.data.data;
}

export async function getFarmJobs(params = {}) {
  const response = await apiClient.get('/farm-jobs', { params });
  return response.data.data;
}

export async function getFarmJob(identifier) {
  const response = await apiClient.get(`/farm-jobs/${identifier}`);
  return response.data.data;
}

export async function getMyFarmJobs(params = {}) {
  const response = await apiClient.get('/farm-jobs/my/posted', { params });
  return response.data.data;
}

export async function createFarmJob(payload) {
  const response = await apiClient.post('/farm-jobs', payload);
  return response.data.data;
}

export async function updateFarmJob(id, payload) {
  const response = await apiClient.patch(`/farm-jobs/${id}`, payload);
  return response.data.data;
}

export async function updateFarmJobStatus(id, action) {
  const response = await apiClient.patch(`/farm-jobs/${id}/status`, { action });
  return response.data.data;
}

export async function applyToFarmJob(jobId, payload) {
  const response = await apiClient.post(`/farm-jobs/${jobId}/apply`, payload);
  return response.data.data;
}

export async function getMyJobApplications() {
  const response = await apiClient.get('/farm-jobs/applications/my');
  return response.data.data;
}

export async function getJobApplications(jobId) {
  const response = await apiClient.get(`/farm-jobs/${jobId}/applications`);
  return response.data.data;
}

export async function actionJobApplication(id, action, payload = {}) {
  const response = await apiClient.post(`/farm-jobs/applications/${id}/${action}`, payload);
  return response.data.data;
}

export async function getWorkerBookings() {
  const response = await apiClient.get('/worker-bookings');
  return response.data.data;
}

export async function getWorkerBooking(id) {
  const response = await apiClient.get(`/worker-bookings/${id}`);
  return response.data.data;
}

export async function confirmWorkerBooking(id) {
  const response = await apiClient.post(`/worker-bookings/${id}/confirm`);
  return response.data.data;
}

export async function startWorkerBooking(id) {
  const response = await apiClient.post(`/worker-bookings/${id}/start`);
  return response.data.data;
}

export async function updateBookingProgress(id, payload) {
  const response = await apiClient.post(`/worker-bookings/${id}/progress`, payload);
  return response.data.data;
}

export async function completeWorkerBooking(id) {
  const response = await apiClient.post(`/worker-bookings/${id}/complete`);
  return response.data.data;
}

export async function cancelWorkerBooking(id, payload) {
  const response = await apiClient.post(`/worker-bookings/${id}/cancel`, payload);
  return response.data.data;
}

export async function getFarmManagementAssignments() {
  const response = await apiClient.get('/farm-management');
  return response.data.data;
}

export async function getFarmManagementAssignment(id) {
  const response = await apiClient.get(`/farm-management/${id}`);
  return response.data.data;
}

export async function createFarmProgressReport(id, payload) {
  const response = await apiClient.post(`/farm-management/${id}/reports`, payload);
  return response.data.data;
}

export async function getFarmProgressReports(id) {
  const response = await apiClient.get(`/farm-management/${id}/reports`);
  return response.data.data;
}

export async function submitReportFeedback(reportId, payload) {
  const response = await apiClient.post(`/farm-management/reports/${reportId}/feedback`, payload);
  return response.data.data;
}
