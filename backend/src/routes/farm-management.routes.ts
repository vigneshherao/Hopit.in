import { Router } from 'express';
import {
  createFarmManagementController,
  createFarmReportController,
  getFarmManagementController,
  listFarmManagementController,
  listFarmReportsController,
  reportFeedbackController,
} from '@/controllers/farm-management.controller.js';
import { authenticate } from '@/middleware/auth.js';
import { validateRequest } from '@/middleware/validate-request.js';
import { asyncHandler } from '@/utils/async-handler.js';
import { createAssignmentSchema, idParamSchema, reportFeedbackSchema, reportIdParamSchema, reportSchema } from '@/validators/worker.validator.js';

export const farmManagementRouter = Router();

farmManagementRouter.use(authenticate);
farmManagementRouter.post('/', validateRequest({ body: createAssignmentSchema }), asyncHandler(createFarmManagementController));
farmManagementRouter.get('/', asyncHandler(listFarmManagementController));
farmManagementRouter.get('/:id', validateRequest({ params: idParamSchema }), asyncHandler(getFarmManagementController));
farmManagementRouter.post('/:id/reports', validateRequest({ params: idParamSchema, body: reportSchema }), asyncHandler(createFarmReportController));
farmManagementRouter.get('/:id/reports', validateRequest({ params: idParamSchema }), asyncHandler(listFarmReportsController));
farmManagementRouter.post('/reports/:reportId/feedback', validateRequest({ params: reportIdParamSchema, body: reportFeedbackSchema }), asyncHandler(reportFeedbackController));
