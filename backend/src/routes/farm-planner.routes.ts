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
import {
  cancelFarmTaskController,
  completeFarmTaskController,
  createFarmTaskController,
  deleteFarmTaskController,
  getFarmTaskController,
  listFarmTasksController,
  listPlanTasksController,
  reassignFarmTaskController,
  startFarmTaskController,
  updateFarmTaskController,
} from '@/controllers/farm-task.controller.js';
import { authenticate } from '@/middleware/auth.js';
import { validateRequest } from '@/middleware/validate-request.js';
import { asyncHandler } from '@/utils/async-handler.js';
import { farmPlanIdParamSchema, farmPlanQuerySchema, farmPlanUpdateSchema, generateFarmPlanSchema, recalculateFarmPlanSchema } from '@/validators/farm-planner.validator.js';
import { createFarmTaskSchema, farmPlanTaskParamSchema, farmTaskIdParamSchema, farmTaskQuerySchema, reassignTaskSchema, updateFarmTaskSchema } from '@/validators/farm-task.validator.js';

export const farmPlannerRouter = Router();

farmPlannerRouter.use(authenticate);
farmPlannerRouter.post('/generate-plan', validateRequest({ body: generateFarmPlanSchema }), asyncHandler(generateFarmPlanController));
farmPlannerRouter.get('/tasks', validateRequest({ query: farmTaskQuerySchema }), asyncHandler(listFarmTasksController));
farmPlannerRouter.post('/tasks', validateRequest({ body: createFarmTaskSchema }), asyncHandler(createFarmTaskController));
farmPlannerRouter.get('/tasks/:id', validateRequest({ params: farmTaskIdParamSchema }), asyncHandler(getFarmTaskController));
farmPlannerRouter.patch('/tasks/:id', validateRequest({ params: farmTaskIdParamSchema, body: updateFarmTaskSchema }), asyncHandler(updateFarmTaskController));
farmPlannerRouter.delete('/tasks/:id', validateRequest({ params: farmTaskIdParamSchema }), asyncHandler(deleteFarmTaskController));
farmPlannerRouter.post('/tasks/:id/complete', validateRequest({ params: farmTaskIdParamSchema }), asyncHandler(completeFarmTaskController));
farmPlannerRouter.post('/tasks/:id/start', validateRequest({ params: farmTaskIdParamSchema }), asyncHandler(startFarmTaskController));
farmPlannerRouter.post('/tasks/:id/cancel', validateRequest({ params: farmTaskIdParamSchema }), asyncHandler(cancelFarmTaskController));
farmPlannerRouter.post('/tasks/:id/reassign', validateRequest({ params: farmTaskIdParamSchema, body: reassignTaskSchema }), asyncHandler(reassignFarmTaskController));
farmPlannerRouter.get('/plans', validateRequest({ query: farmPlanQuerySchema }), asyncHandler(listFarmPlansController));
farmPlannerRouter.get('/plans/:id/tasks', validateRequest({ params: farmPlanTaskParamSchema }), asyncHandler(listPlanTasksController));
farmPlannerRouter.get('/plans/:id', validateRequest({ params: farmPlanIdParamSchema }), asyncHandler(getFarmPlanController));
farmPlannerRouter.patch('/plans/:id', validateRequest({ params: farmPlanIdParamSchema, body: farmPlanUpdateSchema }), asyncHandler(updateFarmPlanController));
farmPlannerRouter.delete('/plans/:id', validateRequest({ params: farmPlanIdParamSchema }), asyncHandler(deleteFarmPlanController));
farmPlannerRouter.post('/plans/:id/recalculate', validateRequest({ params: farmPlanIdParamSchema, body: recalculateFarmPlanSchema }), asyncHandler(recalculateFarmPlanController));
farmPlannerRouter.get('/plans/:id/dashboard', validateRequest({ params: farmPlanIdParamSchema }), asyncHandler(farmPlanDashboardController));
