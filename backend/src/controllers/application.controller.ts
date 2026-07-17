import type { Request, Response } from 'express';
import {
  acceptApplication,
  acceptNegotiatedTerms,
  beginReview,
  cancelApplication,
  createApplication,
  getApplicationDetails,
  getApplicationStatistics,
  getMyApplications,
  getReceivedApplications,
  negotiateApplication,
  rejectApplication,
  requestApplicationChanges,
  shortlistApplication,
  submitApplication,
  updateDraftApplication,
  uploadApplicationFiles,
  withdrawApplication,
} from '@/services/application.service.js';
import { AppError } from '@/utils/app-error.js';
import { sendSuccess } from '@/utils/api-response.js';

export async function createApplicationController(req: Request, res: Response) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const application = await createApplication(req.body, req.user);
  sendSuccess(res, 201, 'Application created', { application });
}

export async function submitApplicationController(req: Request, res: Response) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const application = await submitApplication(String(req.params.id), req.user);
  sendSuccess(res, 200, 'Application submitted', { application });
}

export async function myApplicationsController(req: Request, res: Response) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const result = await getMyApplications(req.query as never, req.user);
  sendSuccess(res, 200, 'Applications loaded', result);
}

export async function receivedApplicationsController(req: Request, res: Response) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const result = await getReceivedApplications(req.query as never, req.user);
  sendSuccess(res, 200, 'Received applications loaded', result);
}

export async function applicationDetailsController(req: Request, res: Response) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const result = await getApplicationDetails(String(req.params.id), req.user);
  sendSuccess(res, 200, 'Application loaded', result);
}

export async function updateApplicationController(req: Request, res: Response) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const application = await updateDraftApplication(String(req.params.id), req.body, req.user);
  sendSuccess(res, 200, 'Application updated', { application });
}

export async function withdrawApplicationController(req: Request, res: Response) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const application = await withdrawApplication(String(req.params.id), req.user);
  sendSuccess(res, 200, 'Application withdrawn', { application });
}

export async function reviewApplicationController(req: Request, res: Response) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const application = await beginReview(String(req.params.id), req.user);
  sendSuccess(res, 200, 'Application under review', { application });
}

export async function shortlistApplicationController(req: Request, res: Response) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const application = await shortlistApplication(String(req.params.id), req.user);
  sendSuccess(res, 200, 'Application shortlisted', { application });
}

export async function requestChangesController(req: Request, res: Response) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const application = await requestApplicationChanges(String(req.params.id), req.body.message, req.user);
  sendSuccess(res, 200, 'Changes requested', { application });
}

export async function rejectApplicationController(req: Request, res: Response) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const application = await rejectApplication(String(req.params.id), req.body.reason, req.user);
  sendSuccess(res, 200, 'Application rejected', { application });
}

export async function negotiateApplicationController(req: Request, res: Response) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const application = await negotiateApplication(String(req.params.id), req.body, req.user);
  sendSuccess(res, 200, 'Counter-offer submitted', { application });
}

export async function acceptTermsController(req: Request, res: Response) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const application = await acceptNegotiatedTerms(String(req.params.id), req.user);
  sendSuccess(res, 200, 'Terms accepted', { application });
}

export async function acceptApplicationController(req: Request, res: Response) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const result = await acceptApplication(String(req.params.id), req.user);
  sendSuccess(res, 200, 'Application accepted', result);
}

export async function cancelApplicationController(req: Request, res: Response) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const application = await cancelApplication(String(req.params.id), req.body.reason, req.user);
  sendSuccess(res, 200, 'Application cancelled', { application });
}

export async function applicationStatisticsController(req: Request, res: Response) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const statistics = await getApplicationStatistics(req.user);
  sendSuccess(res, 200, 'Application statistics loaded', { statistics });
}

export async function uploadApplicationDocumentsController(req: Request, res: Response) {
  const uploads = await uploadApplicationFiles(req.files as Express.Multer.File[]);
  sendSuccess(res, 201, 'Application documents uploaded', { uploads });
}
