export interface HealthStatus {
  success: true;
  uptime: number;
}

export function getHealthStatus(): HealthStatus {
  return {
    success: true,
    uptime: process.uptime(),
  };
}
