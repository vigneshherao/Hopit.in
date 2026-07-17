import { apiClient } from '@/services/apiClient.js';

export async function getHealth() {
  const { data } = await apiClient.get('/health');
  return data;
}
