import type { Request, Response } from 'express';
import * as workerService from '@/services/worker.service.js';
import { AppError } from '@/utils/app-error.js';
import { sendSuccess } from '@/utils/api-response.js';

function requireUser(req: Request) {
  if (!req.user) throw new AppError('Authentication token is required.', 401);
  return req.user;
}

export async function createFarmManagementController(req: Request, res: Response) {
  const assignment = await workerService.createFarmManagement(req.body, requireUser(req));
  sendSuccess(res, 201, 'Farm management assignment created', { assignment });
}

export async function listFarmManagementController(req: Request, res: Response) {
  const result = await workerService.listFarmManagement(requireUser(req));
  sendSuccess(res, 200, 'Farm management assignments loaded', result);
}

export async function getFarmManagementController(req: Request, res: Response) {
  const assignment = await workerService.getFarmManagement(String(req.params.id), requireUser(req));
  sendSuccess(res, 200, 'Farm management assignment loaded', { assignment });
}

export async function createFarmReportController(req: Request, res: Response) {
  const report = await workerService.createFarmReport(String(req.params.id), req.body, requireUser(req));
  sendSuccess(res, 201, 'Farm progress report created', { report });
}

export async function listFarmReportsController(req: Request, res: Response) {
  const result = await workerService.listFarmReports(String(req.params.id), requireUser(req));
  sendSuccess(res, 200, 'Farm progress reports loaded', result);
}

export async function reportFeedbackController(req: Request, res: Response) {
  const report = await workerService.submitReportFeedback(String(req.params.reportId), req.body.message, requireUser(req));
  sendSuccess(res, 200, 'Farm progress report feedback saved', { report });
}
