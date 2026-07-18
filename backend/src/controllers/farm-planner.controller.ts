import type { Request, Response } from 'express';
import {
  deleteFarmPlan,
  generateFarmPlan,
  getFarmPlan,
  getFarmPlanDashboard,
  listFarmPlans,
  recalculateFarmPlan,
  updateFarmPlan,
} from '@/services/farm-planner.service.js';
import { sendSuccess } from '@/utils/api-response.js';
import type { FarmPlanQuery, FarmPlanUpdateInput, GenerateFarmPlanInput, RecalculateFarmPlanInput } from '@/validators/farm-planner.validator.js';

export async function generateFarmPlanController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 201, 'Farm plan generated.', await generateFarmPlan(req.body as GenerateFarmPlanInput, req.user!));
}

export async function listFarmPlansController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Farm plans fetched.', await listFarmPlans(req.query as unknown as FarmPlanQuery, req.user!));
}

export async function getFarmPlanController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Farm plan fetched.', await getFarmPlan(String(req.params.id), req.user!));
}

export async function updateFarmPlanController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Farm plan updated.', await updateFarmPlan(String(req.params.id), req.body as FarmPlanUpdateInput, req.user!));
}

export async function deleteFarmPlanController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Farm plan deleted.', await deleteFarmPlan(String(req.params.id), req.user!));
}

export async function recalculateFarmPlanController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Farm plan recalculated.', await recalculateFarmPlan(String(req.params.id), req.body as RecalculateFarmPlanInput, req.user!));
}

export async function farmPlanDashboardController(req: Request, res: Response): Promise<void> {
  sendSuccess(res, 200, 'Farm plan dashboard fetched.', await getFarmPlanDashboard(String(req.params.id), req.user!));
}
