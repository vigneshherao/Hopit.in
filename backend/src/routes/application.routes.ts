import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  acceptApplicationController,
  acceptTermsController,
  applicationDetailsController,
  applicationStatisticsController,
  cancelApplicationController,
  createApplicationController,
  myApplicationsController,
  negotiateApplicationController,
  receivedApplicationsController,
  rejectApplicationController,
  requestChangesController,
  reviewApplicationController,
  shortlistApplicationController,
  submitApplicationController,
  updateApplicationController,
  uploadApplicationDocumentsController,
  withdrawApplicationController,
} from '@/controllers/application.controller.js';
import { upload } from '@/config/multer.js';
import { authenticate, authorize } from '@/middleware/auth.js';
import { validateRequest } from '@/middleware/validate-request.js';
import { asyncHandler } from '@/utils/async-handler.js';
import {
  applicationFilterSchema,
  cancelSchema,
  createApplicationSchema,
  idParamSchema,
  messageSchema,
  negotiationSchema,
  rejectionSchema,
  updateApplicationSchema,
} from '@/validators/application.validator.js';

export const applicationRouter = Router();

const applicationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many application requests. Please try again shortly.' },
});

applicationRouter.use(authenticate);
applicationRouter.get('/statistics', asyncHandler(applicationStatisticsController));
applicationRouter.get('/my', authorize('farmer', 'owner', 'admin'), validateRequest({ query: applicationFilterSchema }), asyncHandler(myApplicationsController));
applicationRouter.get('/received', authorize('owner', 'admin'), validateRequest({ query: applicationFilterSchema }), asyncHandler(receivedApplicationsController));
applicationRouter.post('/', applicationRateLimit, authorize('farmer', 'owner', 'admin'), validateRequest({ body: createApplicationSchema }), asyncHandler(createApplicationController));
applicationRouter.post('/upload/documents', applicationRateLimit, authorize('farmer', 'owner', 'admin'), upload.array('files', 8), asyncHandler(uploadApplicationDocumentsController));
applicationRouter.get('/:id', validateRequest({ params: idParamSchema }), asyncHandler(applicationDetailsController));
applicationRouter.patch('/:id', validateRequest({ params: idParamSchema, body: updateApplicationSchema }), asyncHandler(updateApplicationController));
applicationRouter.post('/:id/submit', validateRequest({ params: idParamSchema }), asyncHandler(submitApplicationController));
applicationRouter.post('/:id/withdraw', validateRequest({ params: idParamSchema }), asyncHandler(withdrawApplicationController));
applicationRouter.post('/:id/review', validateRequest({ params: idParamSchema }), asyncHandler(reviewApplicationController));
applicationRouter.post('/:id/shortlist', validateRequest({ params: idParamSchema }), asyncHandler(shortlistApplicationController));
applicationRouter.post('/:id/request-changes', validateRequest({ params: idParamSchema, body: messageSchema }), asyncHandler(requestChangesController));
applicationRouter.post('/:id/reject', validateRequest({ params: idParamSchema, body: rejectionSchema }), asyncHandler(rejectApplicationController));
applicationRouter.post('/:id/negotiate', applicationRateLimit, validateRequest({ params: idParamSchema, body: negotiationSchema }), asyncHandler(negotiateApplicationController));
applicationRouter.post('/:id/accept-terms', validateRequest({ params: idParamSchema }), asyncHandler(acceptTermsController));
applicationRouter.post('/:id/accept', validateRequest({ params: idParamSchema }), asyncHandler(acceptApplicationController));
applicationRouter.post('/:id/cancel', validateRequest({ params: idParamSchema, body: cancelSchema }), asyncHandler(cancelApplicationController));
