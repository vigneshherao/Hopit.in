import type { Request, Response } from 'express';
import {
  confirmAgreementForLegalReview,
  getAgreement,
  regenerateAgreement,
  requestAgreementChanges,
} from '@/services/agreement.service.js';
import { AppError } from '@/utils/app-error.js';
import { sendSuccess } from '@/utils/api-response.js';

export async function getAgreementController(req: Request, res: Response) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const agreement = await getAgreement(String(req.params.id), req.user);
  sendSuccess(res, 200, 'Agreement loaded', { agreement });
}

export async function regenerateAgreementController(req: Request, res: Response) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const agreement = await regenerateAgreement(String(req.params.id), req.user);
  sendSuccess(res, 200, 'Agreement regenerated', { agreement });
}

export async function requestAgreementChangesController(req: Request, res: Response) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const agreement = await requestAgreementChanges(String(req.params.id), req.body.message, req.user);
  sendSuccess(res, 200, 'Agreement changes requested', { agreement });
}

export async function confirmAgreementController(req: Request, res: Response) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const agreement = await confirmAgreementForLegalReview(String(req.params.id), req.user);
  sendSuccess(res, 200, 'Agreement confirmation updated', { agreement });
}
