import { apiClient } from '@/services/apiClient.js';

export async function getAdminMe() {
  const response = await apiClient.get('/admin/me');
  return response.data.data;
}

export async function updateAdminMe(payload) {
  const response = await apiClient.patch('/admin/me', payload);
  return response.data.data;
}

export async function getAdminOverview() {
  const response = await apiClient.get('/admin/dashboard/overview');
  return response.data.data;
}

export async function getAdminUsers(params = {}) {
  const response = await apiClient.get('/admin/users', { params });
  return response.data.data;
}

export async function getAdminUser(userId) {
  const response = await apiClient.get(`/admin/users/${userId}`);
  return response.data.data;
}

export async function updateAdminUser(userId, payload) {
  const response = await apiClient.patch(`/admin/users/${userId}`, payload);
  return response.data.data;
}

export async function changeAdminUserStatus(userId, action, payload) {
  const response = await apiClient.post(`/admin/users/${userId}/${action}`, payload);
  return response.data.data;
}

export async function getAdminVerifications(params = {}) {
  const response = await apiClient.get('/admin/verifications', { params });
  return response.data.data;
}

export async function getAdminVerification(verificationId) {
  const response = await apiClient.get(`/admin/verifications/${verificationId}`);
  return response.data.data;
}

export async function updateAdminVerification(verificationId, action, payload = {}) {
  const response = await apiClient.post(`/admin/verifications/${verificationId}/${action}`, payload);
  return response.data.data;
}

export async function getAdminAccounts() {
  const response = await apiClient.get('/admin/admins');
  return response.data.data;
}

export async function getAdminAccount(adminId) {
  const response = await apiClient.get(`/admin/admins/${adminId}`);
  return response.data.data;
}

export async function createAdminAccount(payload) {
  const response = await apiClient.post('/admin/admins', payload);
  return response.data.data;
}

export async function updateAdminAccount(adminId, payload) {
  const response = await apiClient.patch(`/admin/admins/${adminId}`, payload);
  return response.data.data;
}

export async function setAdminPermissionOverride(adminId, payload) {
  const response = await apiClient.post(`/admin/admins/${adminId}/permission-overrides`, payload);
  return response.data.data;
}

export async function getAdminRoles() {
  const response = await apiClient.get('/admin/roles');
  return response.data.data;
}

export async function createAdminRole(payload) {
  const response = await apiClient.post('/admin/roles', payload);
  return response.data.data;
}

export async function updateAdminRole(roleId, payload) {
  const response = await apiClient.patch(`/admin/roles/${roleId}`, payload);
  return response.data.data;
}

export async function deleteAdminRole(roleId) {
  const response = await apiClient.delete(`/admin/roles/${roleId}`);
  return response.data.data;
}

export async function getAdminPermissions() {
  const response = await apiClient.get('/admin/permissions');
  return response.data.data;
}

export async function getAdminAuditLogs(params = {}) {
  const response = await apiClient.get('/admin/audit-logs', { params });
  return response.data.data;
}

export async function getAdminSavedViews(params = {}) {
  const response = await apiClient.get('/admin/saved-views', { params });
  return response.data.data;
}

export async function createAdminSavedView(payload) {
  const response = await apiClient.post('/admin/saved-views', payload);
  return response.data.data;
}

export async function updateAdminSavedView(viewId, payload) {
  const response = await apiClient.patch(`/admin/saved-views/${viewId}`, payload);
  return response.data.data;
}

export async function deleteAdminSavedView(viewId) {
  const response = await apiClient.delete(`/admin/saved-views/${viewId}`);
  return response.data.data;
}
