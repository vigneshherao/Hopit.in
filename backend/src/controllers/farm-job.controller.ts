import type { Request, Response } from 'express';
import * as workerService from '@/services/worker.service.js';
import { AppError } from '@/utils/app-error.js';
import { sendSuccess } from '@/utils/api-response.js';

function requireUser(req: Request) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  return req.user;
}

export async function createFarmJobController(req: Request, res: Response) {
  const job = await workerService.createFarmJob(req.body, requireUser(req));
  sendSuccess(res, 201, 'Farm job created', { job });
}

export async function listFarmJobsController(req: Request, res: Response) {
  const result = await workerService.listFarmJobs(req.query as never, req.user);
  sendSuccess(res, 200, 'Farm jobs loaded', result);
}

export async function getFarmJobController(req: Request, res: Response) {
  const result = await workerService.getFarmJob(String(req.params.identifier), req.user);
  sendSuccess(res, 200, 'Farm job loaded', result);
}

export async function myFarmJobsController(req: Request, res: Response) {
  const result = await workerService.getMyFarmJobs(req.query as never, requireUser(req));
  sendSuccess(res, 200, 'Posted farm jobs loaded', result);
}

export async function updateFarmJobController(req: Request, res: Response) {
  const job = await workerService.updateFarmJob(String(req.params.id), req.body, requireUser(req));
  sendSuccess(res, 200, 'Farm job updated', { job });
}

export async function updateFarmJobStatusController(req: Request, res: Response) {
  const job = await workerService.updateFarmJobStatus(String(req.params.id), req.body.action, requireUser(req));
  sendSuccess(res, 200, 'Farm job status updated', { job });
}

export async function deleteFarmJobController(req: Request, res: Response) {
  const result = await workerService.deleteFarmJob(String(req.params.id), requireUser(req));
  sendSuccess(res, 200, result.deleted ? 'Farm job deleted' : 'Farm job cancelled', result);
}

export async function farmJobStatisticsController(req: Request, res: Response) {
  const statistics = await workerService.getFarmJobStatistics(requireUser(req));
  sendSuccess(res, 200, 'Farm job statistics loaded', { statistics });
}

export async function applyFarmJobController(req: Request, res: Response) {
  const application = await workerService.applyToFarmJob(String(req.params.jobId), req.body, requireUser(req));
  sendSuccess(res, 201, 'Farm job application submitted', { application });
}

export async function myJobApplicationsController(req: Request, res: Response) {
  const result = await workerService.getMyJobApplications(requireUser(req));
  sendSuccess(res, 200, 'Job applications loaded', result);
}

export async function jobApplicationsController(req: Request, res: Response) {
  const result = await workerService.getJobApplications(String(req.params.jobId), requireUser(req));
  sendSuccess(res, 200, 'Farm job applicants loaded', result);
}

export async function jobApplicationController(req: Request, res: Response) {
  const application = await workerService.getJobApplication(String(req.params.id), requireUser(req));
  sendSuccess(res, 200, 'Farm job application loaded', { application });
}

export async function jobApplicationActionController(req: Request, res: Response) {
  const result = await workerService.actionJobApplication(String(req.params.id), String(req.params.action), requireUser(req), req.body.reason ?? req.body.notes);
  sendSuccess(res, 200, 'Farm job application updated', result);
}
