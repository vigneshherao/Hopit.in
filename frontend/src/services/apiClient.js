import axios from 'axios';
import { env } from '@/services/env.js';
import { getAccessToken, notifyUnauthorized, setAccessToken } from '@/services/tokenStore.js';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshQueue = [];

function resolveQueue(error, token = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  refreshQueue = [];
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['X-Request-ID'] = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url ?? '';

    if (status !== 401 || originalRequest?._retry || url.includes('/auth/login') || url.includes('/auth/register')) {
      return Promise.reject(error);
    }

    if (url.includes('/auth/refresh')) {
      notifyUnauthorized();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await apiClient.post('/auth/refresh', {});
      const token = data.data.accessToken;
      setAccessToken(token);
      resolveQueue(null, token);
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      resolveQueue(refreshError);
      notifyUnauthorized();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
