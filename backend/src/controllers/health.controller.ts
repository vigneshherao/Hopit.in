import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { getHealthStatus } from '@/services/health.service.js';

export function healthController(_req: Request, res: Response): void {
  res.status(200).json(getHealthStatus());
}

export function readinessController(_req: Request, res: Response): void {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    success: databaseReady,
    status: databaseReady ? 'ready' : 'not-ready',
    checks: { database: databaseReady ? 'up' : 'down' },
  });
}
