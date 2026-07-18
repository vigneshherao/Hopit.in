import type { Response } from 'express';
import { assignModerator, createListingFlag, decideModeration, getModeration, listModerationHistory, listModerationQueue, reviewModeration } from '@/services/marketplace-moderation.service.js';
import type { AuthenticatedRequest } from '@/types/http.js';
import { sendSuccess } from '@/utils/api-response.js';

export async function moderationQueueController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Moderation queue retrieved.', await listModerationQueue(req.query as never));
}

export async function moderationPendingController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Pending moderation queue retrieved.', await listModerationQueue({ ...(req.query as Record<string, unknown>), queue: 'pending' } as never));
}

export async function moderationApprovedController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Approved moderation records retrieved.', await listModerationQueue({ ...(req.query as Record<string, unknown>), status: 'published' } as never));
}

export async function moderationRejectedController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Rejected moderation records retrieved.', await listModerationQueue({ ...(req.query as Record<string, unknown>), status: 'rejected' } as never));
}

export async function moderationRevisionController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Revision moderation records retrieved.', await listModerationQueue({ ...(req.query as Record<string, unknown>), status: 'needs-revision' } as never));
}

export async function moderationHistoryController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Moderation history retrieved.', await listModerationHistory(req.query as never));
}

export async function moderationDetailController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Moderation record retrieved.', await getModeration(req.params.moderationId as string));
}

export async function assignModerationController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Listing assigned.', await assignModerator(req, req.body));
}

export async function reviewModerationController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Listing reviewed.', await reviewModeration(req, req.body));
}

export async function decideModerationController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Moderation decision saved.', await decideModeration(req, req.body));
}

export async function moderationActionController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Moderation action completed.', await decideModeration(req, { ...req.body, decision: req.params.action }));
}

export async function approveModerationController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Listing approved.', await decideModeration(req, { ...req.body, decision: 'approve' } as never));
}

export async function rejectModerationController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Listing rejected.', await decideModeration(req, { ...req.body, decision: 'reject' } as never));
}

export async function revisionModerationController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Listing revision requested.', await decideModeration(req, { ...req.body, decision: 'request-revision' } as never));
}

export async function escalateModerationController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Listing escalated.', await decideModeration(req, { ...req.body, decision: 'escalate' } as never));
}

export async function archiveModerationController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Listing archived.', await decideModeration(req, { ...req.body, decision: 'archive' } as never));
}

export async function hideModerationController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Listing hidden.', await decideModeration(req, { ...req.body, decision: 'hide' } as never));
}

export async function removeModerationController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Listing removed.', await decideModeration(req, { ...req.body, decision: 'remove' } as never));
}

export async function flagListingController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 201, 'Listing flag created.', await createListingFlag(req, req.body));
}
