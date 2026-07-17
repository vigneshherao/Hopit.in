import type { Request, Response } from 'express';
import {
  changeLandStatus,
  createLandListing,
  deleteLandListing,
  getLandDetails,
  getLandStatistics,
  getMyLands,
  getPublicLands,
  removeUploadedFile,
  submitLandForVerification,
  updateLandListing,
  uploadLandFiles,
  verifyLandListing,
} from '@/services/land.service.js';
import { AppError } from '@/utils/app-error.js';
import { sendSuccess } from '@/utils/api-response.js';

export async function createLandController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const land = await createLandListing(req.body, req.user.id);
  sendSuccess(res, 201, 'Land listing created', { land });
}

export async function listLandsController(req: Request, res: Response): Promise<void> {
  const result = await getPublicLands(req.query as never, { user: req.user });
  sendSuccess(res, 200, 'Land listings loaded', result);
}

export async function getLandController(req: Request, res: Response): Promise<void> {
  const result = await getLandDetails(String(req.params.identifier), { user: req.user }, req.get('x-hopit-view-key'));
  sendSuccess(res, 200, 'Land listing loaded', result);
}

export async function myLandsController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const result = await getMyLands(req.query as never, req.user.id, req.user.role);
  sendSuccess(res, 200, 'Owner listings loaded', result);
}

export async function updateLandController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const land = await updateLandListing(String(req.params.id), req.body, req.user.id, req.user.role);
  sendSuccess(res, 200, 'Land listing updated', { land });
}

export async function deleteLandController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const result = await deleteLandListing(String(req.params.id), req.user.id, req.user.role);
  sendSuccess(res, 200, result.deleted ? 'Land listing deleted' : 'Land listing deactivated', result);
}

export async function submitVerificationController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const land = await submitLandForVerification(String(req.params.id), req.user.id);
  sendSuccess(res, 200, 'Land listing submitted for verification', { land });
}

export async function verifyLandController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const land = await verifyLandListing(String(req.params.id), req.body.action, req.user.id, req.body.reason);
  sendSuccess(res, 200, req.body.action === 'approve' ? 'Land listing approved' : 'Land listing rejected', { land });
}

export async function statusLandController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const land = await changeLandStatus(String(req.params.id), req.body.action, req.user.id, req.user.role);
  sendSuccess(res, 200, 'Land listing status updated', { land });
}

export async function statisticsController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  const statistics = await getLandStatistics(req.user.id, req.user.role);
  sendSuccess(res, 200, 'Land statistics loaded', { statistics });
}

export async function uploadImagesController(req: Request, res: Response): Promise<void> {
  const uploads = await uploadLandFiles(req.files as Express.Multer.File[], 'images');
  sendSuccess(res, 201, 'Images uploaded', { uploads });
}

export async function uploadDocumentsController(req: Request, res: Response): Promise<void> {
  const uploads = await uploadLandFiles(req.files as Express.Multer.File[], 'documents');
  sendSuccess(res, 201, 'Documents uploaded', { uploads });
}

export async function deleteUploadController(req: Request, res: Response): Promise<void> {
  if (!req.body.url || typeof req.body.url !== 'string') {
    throw new AppError('Upload URL is required.', 400);
  }
  await removeUploadedFile(req.body.url);
  sendSuccess(res, 200, 'Upload removed');
}
