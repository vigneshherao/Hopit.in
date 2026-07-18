import { Router } from 'express';
import {
  cancelWorkerBookingController,
  completeWorkerBookingController,
  confirmWorkerBookingController,
  getWorkerBookingController,
  listWorkerBookingsController,
  progressWorkerBookingController,
  reviewWorkerBookingController,
  startWorkerBookingController,
} from '@/controllers/worker-booking.controller.js';
import { authenticate } from '@/middleware/auth.js';
import { validateRequest } from '@/middleware/validate-request.js';
import { asyncHandler } from '@/utils/async-handler.js';
import { bookingCancelSchema, bookingProgressSchema, idParamSchema, reviewSchema } from '@/validators/worker.validator.js';

export const workerBookingRouter = Router();

workerBookingRouter.use(authenticate);
workerBookingRouter.get('/', asyncHandler(listWorkerBookingsController));
workerBookingRouter.get('/:id', validateRequest({ params: idParamSchema }), asyncHandler(getWorkerBookingController));
workerBookingRouter.post('/:id/confirm', validateRequest({ params: idParamSchema }), asyncHandler(confirmWorkerBookingController));
workerBookingRouter.post('/:id/start', validateRequest({ params: idParamSchema }), asyncHandler(startWorkerBookingController));
workerBookingRouter.post('/:id/progress', validateRequest({ params: idParamSchema, body: bookingProgressSchema }), asyncHandler(progressWorkerBookingController));
workerBookingRouter.post('/:id/complete', validateRequest({ params: idParamSchema }), asyncHandler(completeWorkerBookingController));
workerBookingRouter.post('/:id/cancel', validateRequest({ params: idParamSchema, body: bookingCancelSchema }), asyncHandler(cancelWorkerBookingController));
workerBookingRouter.post('/:id/review', validateRequest({ params: idParamSchema, body: reviewSchema }), asyncHandler(reviewWorkerBookingController));
