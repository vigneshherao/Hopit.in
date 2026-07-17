import { apiClient } from '@/services/apiClient.js';
import { setAccessToken } from '@/services/tokenStore.js';

function unwrapAuthResponse(response) {
  const payload = response.data.data;
  setAccessToken(payload.accessToken);
  return payload;
}

export async function login(payload) {
  const response = await apiClient.post('/auth/login', payload);
  return unwrapAuthResponse(response);
}

export async function register(payload) {
  const response = await apiClient.post('/auth/register', payload);
  return unwrapAuthResponse(response);
}

export async function refreshSession() {
  const response = await apiClient.post('/auth/refresh', {});
  return unwrapAuthResponse(response);
}

export async function getMe() {
  const response = await apiClient.get('/auth/me');
  return response.data.data;
}

export async function logout() {
  await apiClient.post('/auth/logout', {});
  setAccessToken(null);
}
