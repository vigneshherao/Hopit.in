export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1',
  apiTimeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 45_000,
};
