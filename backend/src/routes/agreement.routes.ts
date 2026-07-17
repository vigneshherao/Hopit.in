import { Router } from 'express';
import {
  confirmAgreementController,
  getAgreementController,
  regenerateAgreementController,
  requestAgreementChangesController,
} from '@/controllers/agreement.controller.js';
import { authenticate } from '@/middleware/auth.js';
import { validateRequest } from '@/middleware/validate-request.js';
import { asyncHandler } from '@/utils/async-handler.js';
import { agreementChangeSchema, idParamSchema } from '@/validators/application.validator.js';

export const agreementRouter = Router();

agreementRouter.use(authenticate);
agreementRouter.get('/:id', validateRequest({ params: idParamSchema }), asyncHandler(getAgreementController));
agreementRouter.post('/:id/regenerate', validateRequest({ params: idParamSchema }), asyncHandler(regenerateAgreementController));
agreementRouter.post(
  '/:id/request-changes',
  validateRequest({ params: idParamSchema, body: agreementChangeSchema }),
  asyncHandler(requestAgreementChangesController),
);
agreementRouter.post('/:id/legal-review', validateRequest({ params: idParamSchema }), asyncHandler(confirmAgreementController));
