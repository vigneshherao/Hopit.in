import { Router } from 'express';
import {
  applyFarmJobController,
  createFarmJobController,
  deleteFarmJobController,
  farmJobStatisticsController,
  getFarmJobController,
  jobApplicationActionController,
  jobApplicationController,
  jobApplicationsController,
  listFarmJobsController,
  myFarmJobsController,
  myJobApplicationsController,
  updateFarmJobController,
  updateFarmJobStatusController,
} from '@/controllers/farm-job.controller.js';
import { authenticate, authorize, optionalAuthenticate } from '@/middleware/auth.js';
import { validateRequest } from '@/middleware/validate-request.js';
import { asyncHandler } from '@/utils/async-handler.js';
import {
  applicationActionSchema,
  createFarmJobSchema,
  farmJobQuerySchema,
  farmJobStatusSchema,
  idParamSchema,
  identifierParamSchema,
  jobApplicationSchema,
  jobApplicationActionParamSchema,
  jobIdParamSchema,
  updateFarmJobSchema,
} from '@/validators/worker.validator.js';

export const farmJobRouter = Router();

farmJobRouter.get('/', optionalAuthenticate, validateRequest({ query: farmJobQuerySchema }), asyncHandler(listFarmJobsController));
farmJobRouter.get('/my/posted', authenticate, authorize('owner', 'farmer', 'admin'), validateRequest({ query: farmJobQuerySchema }), asyncHandler(myFarmJobsController));
farmJobRouter.get('/my/statistics', authenticate, authorize('owner', 'farmer', 'admin'), asyncHandler(farmJobStatisticsController));
farmJobRouter.get('/applications/my', authenticate, authorize('worker', 'admin'), asyncHandler(myJobApplicationsController));
farmJobRouter.get('/applications/:id', authenticate, validateRequest({ params: idParamSchema }), asyncHandler(jobApplicationController));
farmJobRouter.post('/applications/:id/:action(review|shortlist|reject|withdraw|accept)', authenticate, validateRequest({ params: jobApplicationActionParamSchema, body: applicationActionSchema }), asyncHandler(jobApplicationActionController));
farmJobRouter.post('/', authenticate, authorize('owner', 'farmer', 'admin'), validateRequest({ body: createFarmJobSchema }), asyncHandler(createFarmJobController));
farmJobRouter.post('/:jobId/apply', authenticate, authorize('worker', 'admin'), validateRequest({ params: jobIdParamSchema, body: jobApplicationSchema }), asyncHandler(applyFarmJobController));
farmJobRouter.get('/:jobId/applications', authenticate, validateRequest({ params: jobIdParamSchema }), asyncHandler(jobApplicationsController));
farmJobRouter.patch('/:id/status', authenticate, validateRequest({ params: idParamSchema, body: farmJobStatusSchema }), asyncHandler(updateFarmJobStatusController));
farmJobRouter.patch('/:id', authenticate, validateRequest({ params: idParamSchema, body: updateFarmJobSchema }), asyncHandler(updateFarmJobController));
farmJobRouter.delete('/:id', authenticate, validateRequest({ params: idParamSchema }), asyncHandler(deleteFarmJobController));
farmJobRouter.get('/:identifier', optionalAuthenticate, validateRequest({ params: identifierParamSchema }), asyncHandler(getFarmJobController));
