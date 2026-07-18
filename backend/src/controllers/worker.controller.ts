import type { Request, Response } from 'express';
import * as workerService from '@/services/worker.service.js';
import { AppError } from '@/utils/app-error.js';
import { sendSuccess } from '@/utils/api-response.js';

function requireUser(req: Request) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  return req.user;
}

export async function createWorkerProfileController(req: Request, res: Response) {
  const profile = await workerService.createWorkerProfile(req.body, requireUser(req));
  sendSuccess(res, 201, 'Worker profile created', { profile });
}

export async function listWorkersController(req: Request, res: Response) {
  const result = await workerService.listWorkers(req.query as never);
  sendSuccess(res, 200, 'Workers loaded', result);
}

export async function getWorkerController(req: Request, res: Response) {
  const result = await workerService.getWorkerProfile(String(req.params.identifier), req.user);
  sendSuccess(res, 200, 'Worker profile loaded', result);
}

export async function myWorkerProfileController(req: Request, res: Response) {
  const profile = await workerService.getMyWorkerProfile(requireUser(req));
  sendSuccess(res, 200, 'Worker profile loaded', { profile });
}

export async function updateWorkerProfileController(req: Request, res: Response) {
  const profile = await workerService.updateMyWorkerProfile(req.body, requireUser(req));
  sendSuccess(res, 200, 'Worker profile updated', { profile });
}

export async function submitWorkerVerificationController(req: Request, res: Response) {
  const profile = await workerService.submitWorkerVerification(requireUser(req));
  sendSuccess(res, 200, 'Worker profile submitted for verification', { profile });
}

export async function verifyWorkerController(req: Request, res: Response) {
  const profile = await workerService.verifyWorkerProfile(String(req.params.id), req.body.action, requireUser(req).id, req.body.reason);
  sendSuccess(res, 200, 'Worker verification updated', { profile });
}

export async function workerStatisticsController(req: Request, res: Response) {
  const statistics = await workerService.getWorkerStatistics(requireUser(req));
  sendSuccess(res, 200, 'Worker statistics loaded', { statistics });
}
