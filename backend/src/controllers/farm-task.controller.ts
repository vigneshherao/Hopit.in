import type { Request, Response } from 'express';
import {
  cancelFarmTask,
  completeFarmTask,
  createFarmTask,
  deleteFarmTask,
  getFarmTask,
  listFarmTasks,
  listPlanTasks,
  reassignFarmTask,
  startFarmTask,
  updateFarmTask,
} from '@/services/farm-task.service.js';
import { sendSuccess } from '@/utils/api-response.js';
import type { CreateFarmTaskInput, FarmTaskQuery, ReassignTaskInput, UpdateFarmTaskInput } from '@/validators/farm-task.validator.js';

export async function listFarmTasksController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Farm tasks fetched.', await listFarmTasks(req.query as unknown as FarmTaskQuery, req.user!));
}

export async function listPlanTasksController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Plan tasks fetched.', await listPlanTasks(String(req.params.id), req.user!));
}

export async function getFarmTaskController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Farm task fetched.', await getFarmTask(String(req.params.id), req.user!));
}

export async function createFarmTaskController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 201, 'Farm task created.', await createFarmTask(req.body as CreateFarmTaskInput, req.user!));
}

export async function updateFarmTaskController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Farm task updated.', await updateFarmTask(String(req.params.id), req.body as UpdateFarmTaskInput, req.user!));
}

export async function deleteFarmTaskController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Farm task deleted.', await deleteFarmTask(String(req.params.id), req.user!));
}

export async function completeFarmTaskController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Farm task completed.', await completeFarmTask(String(req.params.id), req.user!));
}

export async function startFarmTaskController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Farm task started.', await startFarmTask(String(req.params.id), req.user!));
}

export async function cancelFarmTaskController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Farm task cancelled.', await cancelFarmTask(String(req.params.id), req.user!));
}

export async function reassignFarmTaskController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Farm task reassigned.', await reassignFarmTask(String(req.params.id), req.body as ReassignTaskInput, req.user!));
}
