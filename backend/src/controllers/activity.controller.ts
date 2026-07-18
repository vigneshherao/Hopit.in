import type { Response } from 'express';
import type { AuthenticatedRequest } from '@/types/http.js';
import { listActivities, listEntityActivities } from '@/services/activity/activity.service.js';
import { sendSuccess } from '@/utils/api-response.js';

export async function activitiesController(req: AuthenticatedRequest, res: Response) {
  const data = await listActivities(req.user!.id, req.query);
  sendSuccess(res, 200, 'Activities retrieved.', data);
}

export async function farmActivitiesController(req: AuthenticatedRequest, res: Response) {
  const data = await listEntityActivities(req.user!.id, 'farm', req.params.id as string, req.query);
  sendSuccess(res, 200, 'Farm activities retrieved.', data);
}

export async function agreementActivitiesController(req: AuthenticatedRequest, res: Response) {
  const data = await listEntityActivities(req.user!.id, 'agreement', req.params.id as string, req.query);
  sendSuccess(res, 200, 'Agreement activities retrieved.', data);
}

export async function taskActivitiesController(req: AuthenticatedRequest, res: Response) {
  const data = await listEntityActivities(req.user!.id, 'task', req.params.id as string, req.query);
  sendSuccess(res, 200, 'Task activities retrieved.', data);
}
