import { Router } from 'express';
import { z } from 'zod';
import { activitiesController, agreementActivitiesController, farmActivitiesController, taskActivitiesController } from '@/controllers/activity.controller.js';
import { authenticate } from '@/middleware/auth.js';
import { validateRequest } from '@/middleware/validate-request.js';
import { activityQuerySchema } from '@/services/activity/activity.validation.js';
import { asyncHandler } from '@/utils/async-handler.js';

const idParamSchema = z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id.') });

export const activityRouter = Router();

activityRouter.use(authenticate);
activityRouter.get('/', validateRequest({ query: activityQuerySchema }), asyncHandler(activitiesController));
activityRouter.get('/farm/:id', validateRequest({ params: idParamSchema, query: activityQuerySchema }), asyncHandler(farmActivitiesController));
activityRouter.get('/agreement/:id', validateRequest({ params: idParamSchema, query: activityQuerySchema }), asyncHandler(agreementActivitiesController));
activityRouter.get('/task/:id', validateRequest({ params: idParamSchema, query: activityQuerySchema }), asyncHandler(taskActivitiesController));
