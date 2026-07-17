import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createLandController,
  deleteLandController,
  deleteUploadController,
  getLandController,
  listLandsController,
  myLandsController,
  statisticsController,
  statusLandController,
  submitVerificationController,
  updateLandController,
  uploadDocumentsController,
  uploadImagesController,
  verifyLandController,
} from '@/controllers/land.controller.js';
import { upload } from '@/config/multer.js';
import { authenticate, authorize, optionalAuthenticate } from '@/middleware/auth.js';
import { validateRequest } from '@/middleware/validate-request.js';
import { asyncHandler } from '@/utils/async-handler.js';
import {
  createLandSchema,
  idParamSchema,
  identifierParamSchema,
  landQuerySchema,
  ownerLandQuerySchema,
  statusUpdateSchema,
  updateLandSchema,
  verificationActionSchema,
} from '@/validators/land.validator.js';

export const landRouter = Router();

const landMutationLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 80,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many land marketplace requests. Please try again shortly.',
  },
});

landRouter.get('/', optionalAuthenticate, validateRequest({ query: landQuerySchema }), asyncHandler(listLandsController));
landRouter.get(
  '/my/statistics',
  authenticate,
  authorize('owner', 'admin'),
  asyncHandler(statisticsController),
);
landRouter.get(
  '/my/listings',
  authenticate,
  authorize('owner', 'admin'),
  validateRequest({ query: ownerLandQuerySchema }),
  asyncHandler(myLandsController),
);
landRouter.post(
  '/',
  landMutationLimit,
  authenticate,
  authorize('owner', 'admin'),
  validateRequest({ body: createLandSchema }),
  asyncHandler(createLandController),
);
landRouter.post(
  '/upload/images',
  landMutationLimit,
  authenticate,
  authorize('owner', 'admin'),
  upload.array('files', 10),
  asyncHandler(uploadImagesController),
);
landRouter.post(
  '/upload/documents',
  landMutationLimit,
  authenticate,
  authorize('owner', 'admin'),
  upload.array('files', 10),
  asyncHandler(uploadDocumentsController),
);
landRouter.delete(
  '/upload',
  authenticate,
  authorize('owner', 'admin'),
  asyncHandler(deleteUploadController),
);
landRouter.patch(
  '/:id/verification',
  authenticate,
  authorize('admin'),
  validateRequest({ params: idParamSchema, body: verificationActionSchema }),
  asyncHandler(verifyLandController),
);
landRouter.post(
  '/:id/submit-verification',
  authenticate,
  authorize('owner'),
  validateRequest({ params: idParamSchema }),
  asyncHandler(submitVerificationController),
);
landRouter.patch(
  '/:id/status',
  authenticate,
  authorize('owner', 'admin'),
  validateRequest({ params: idParamSchema, body: statusUpdateSchema }),
  asyncHandler(statusLandController),
);
landRouter.patch(
  '/:id',
  authenticate,
  authorize('owner', 'admin'),
  validateRequest({ params: idParamSchema, body: updateLandSchema }),
  asyncHandler(updateLandController),
);
landRouter.delete(
  '/:id',
  authenticate,
  authorize('owner', 'admin'),
  validateRequest({ params: idParamSchema }),
  asyncHandler(deleteLandController),
);
landRouter.get(
  '/:identifier',
  optionalAuthenticate,
  validateRequest({ params: identifierParamSchema }),
  asyncHandler(getLandController),
);
