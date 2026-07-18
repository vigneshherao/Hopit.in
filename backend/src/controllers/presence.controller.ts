import type { Response } from 'express';
import type { AuthenticatedRequest } from '@/types/http.js';
import { getPresence, listTeamPresence } from '@/services/presence/presence.service.js';
import { sendSuccess } from '@/utils/api-response.js';

export async function presenceController(req: AuthenticatedRequest, res: Response) {
  const data = await getPresence(req.params.userId as string);
  sendSuccess(res, 200, 'Presence retrieved.', data);
}

export async function teamPresenceController(req: AuthenticatedRequest, res: Response) {
  const data = await listTeamPresence(req.user!.id, req.params.farmId as string, req.user!.role);
  sendSuccess(res, 200, 'Team presence retrieved.', data);
}
