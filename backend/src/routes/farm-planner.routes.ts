import { Router } from 'express';
import {
  deleteFarmPlanController,
  farmPlanDashboardController,
  generateFarmPlanController,
  getFarmPlanController,
  listFarmPlansController,
  recalculateFarmPlanController,
  updateFarmPlanController,
} from '@/controllers/farm-planner.controller.js';
import { authenticate } from '@/middleware/auth.js';
import { validateRequest } from '@/middleware/validate-request.js';
import { asyncHandler } from '@/utils/async-handler.js';
import { farmPlanIdParamSchema, farmPlanQuerySchema, farmPlanUpdateSchema, generateFarmPlanSchema, recalculateFarmPlanSchema } from '@/validators/farm-planner.validator.js';

export const farmPlannerRouter = Router();

farmPlannerRouter.use(authenticate);
farmPlannerRouter.post('/generate-plan', validateRequest({ body: generateFarmPlanSchema }), asyncHandler(generateFarmPlanController));
farmPlannerRouter.get('/plans', validateRequest({ query: farmPlanQuerySchema }), asyncHandler(listFarmPlansController));
farmPlannerRouter.get('/plans/:id', validateRequest({ params: farmPlanIdParamSchema }), asyncHandler(getFarmPlanController));
farmPlannerRouter.patch('/plans/:id', validateRequest({ params: farmPlanIdParamSchema, body: farmPlanUpdateSchema }), asyncHandler(updateFarmPlanController));
farmPlannerRouter.delete('/plans/:id', validateRequest({ params: farmPlanIdParamSchema }), asyncHandler(deleteFarmPlanController));
farmPlannerRouter.post('/plans/:id/recalculate', validateRequest({ params: farmPlanIdParamSchema, body: recalculateFarmPlanSchema }), asyncHandler(recalculateFarmPlanController));
farmPlannerRouter.get('/plans/:id/dashboard', validateRequest({ params: farmPlanIdParamSchema }), asyncHandler(farmPlanDashboardController));
