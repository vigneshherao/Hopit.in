import { useQuery } from '@tanstack/react-query';
import { getHealth } from '@/services/healthService.js';

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  });
}
