import type { Request, Response } from 'express';
import { getHealthStatus } from '@/services/health.service.js';

export function healthController(_req: Request, res: Response): void {
  res.status(200).json(getHealthStatus());
}
