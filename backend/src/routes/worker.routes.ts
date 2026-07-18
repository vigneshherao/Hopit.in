import { Router } from 'express';
import {
  createWorkerProfileController,
  getWorkerController,
  listWorkersController,
  myWorkerProfileController,
  submitWorkerVerificationController,
  updateWorkerProfileController,
  verifyWorkerController,
  workerStatisticsController,
} from '@/controllers/worker.controller.js';
import { authenticate, authorize, optionalAuthenticate } from '@/middleware/auth.js';
import { validateRequest } from '@/middleware/validate-request.js';
import { asyncHandler } from '@/utils/async-handler.js';
import { createWorkerProfileSchema, idParamSchema, identifierParamSchema, updateWorkerProfileSchema, verificationActionSchema, workerQuerySchema } from '@/validators/worker.validator.js';

export const workerRouter = Router();

workerRouter.get('/', validateRequest({ query: workerQuerySchema }), asyncHandler(listWorkersController));
workerRouter.post('/profile', authenticate, authorize('worker', 'admin'), validateRequest({ body: createWorkerProfileSchema }), asyncHandler(createWorkerProfileController));
workerRouter.get('/profile/me', authenticate, authorize('worker', 'admin'), asyncHandler(myWorkerProfileController));
workerRouter.patch('/profile/me', authenticate, authorize('worker', 'admin'), validateRequest({ body: updateWorkerProfileSchema }), asyncHandler(updateWorkerProfileController));
workerRouter.post('/profile/submit-verification', authenticate, authorize('worker'), asyncHandler(submitWorkerVerificationController));
workerRouter.get('/profile/statistics', authenticate, authorize('worker', 'admin'), asyncHandler(workerStatisticsController));
workerRouter.patch('/:id/verification', authenticate, authorize('admin'), validateRequest({ params: idParamSchema, body: verificationActionSchema }), asyncHandler(verifyWorkerController));
workerRouter.get('/:identifier', optionalAuthenticate, validateRequest({ params: identifierParamSchema }), asyncHandler(getWorkerController));
