import { Router } from 'express';
import { healthController, readinessController } from '@/controllers/health.controller.js';

export const healthRouter = Router();

healthRouter.get('/', healthController);
healthRouter.get('/ready', readinessController);
