import mongoose, { type FilterQuery, type SortOrder } from 'mongoose';
import { MODERATION_SOCKET_EVENTS, type LAND_MODERATION_STATUSES } from '@/constants/moderation.constants.js';
import { LandModerationModel, type LandModeration, type LandModerationDocument } from '@/models/land-moderation.model.js';
import { LandModel, type Land } from '@/models/land.model.js';
import { ListingFlagModel } from '@/models/listing-flag.model.js';
import { ListingVersionModel } from '@/models/listing-version.model.js';
import { ModerationDecisionModel } from '@/models/moderation-decision.model.js';
import { ModeratorAssignmentModel } from '@/models/moderator-assignment.model.js';
import { UserModel } from '@/models/user.model.js';
import { createNotification } from '@/services/notification/notification.service.js';
import { emitModerationEvent } from '@/services/moderation.socket.js';
import { writeAdminAction } from '@/services/admin.service.js';
import type { AuthenticatedRequest } from '@/types/http.js';
import { AppError } from '@/utils/app-error.js';
import type { ModerationDecisionInput, ModerationQueueQuery } from '@/types/moderation.types.js';

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function moderationStatusToLandStatus(status: string): Land['status'] {
  const map: Record<string, Land['status']> = {
    'pending-review': 'pending-verification',
    'under-verification': 'pending-verification',
    'needs-revision': 'rejected',
    approved: 'available',
    published: 'available',
    rejected: 'rejected',
    archived: 'inactive',
    hidden: 'inactive',
    removed: 'inactive',
    escalated: 'pending-verification',
  };
  return map[status] ?? 'pending-verification';
}

function defaultChecklist(): LandModeration['checklist'] {
  return [
    'owner-name',
    'location',
    'coordinates',
    'land-area',
    'survey-number',
    'ownership-documents',
    'crop-type',
    'photos',
    'price',
    'description',
    'water-availability',
    'electricity',
    'road-access',
  ].map((item) => ({ item: item as never, result: 'needs-review' }));
}

function documentReviewsFromLand(land: Land & { documents?: Land['documents'] }): LandModeration['documentReviews'] {
  return (land.documents ?? []).map((document, index) => ({
    documentId: `${document.type}-${index}`,
    type: document.type === 'ownership-proof' ? 'ownership-certificate' : document.type === 'tax-receipt' ? 'tax-receipt' : document.type === 'survey-document' ? 'survey-document' : document.type === 'identity-proof' ? 'identity-proof' : 'supporting-document',
    name: document.name,
    url: document.url,
    virusScanStatus: 'not-started',
    ocrStatus: 'not-started',
    reviewStatus: document.verificationStatus === 'verified' ? 'verified' : document.verificationStatus === 'rejected' ? 'rejected' : 'pending',
    verificationResult: document.verificationStatus,
    reviewedAt: document.verificationStatus === 'verified' ? new Date() : undefined,
  }));
}

function priorityRank(priority?: string) {
  return priority === 'critical' ? 4 : priority === 'high' ? 3 : priority === 'medium' ? 2 : 1;
}

function buildSort(sort?: string): Record<string, SortOrder> {
  if (sort === 'oldest' || sort === 'submission-time') return { createdAt: 1 };
  if (sort === 'priority') return { priorityRank: -1, createdAt: 1 };
  if (sort === 'review-time') return { reviewDuration: -1, updatedAt: -1 };
  return { createdAt: -1 };
}

function asRecord(value: unknown) {
  return value as Record<string, unknown>;
}

export async function ensureLandModeration(landId: string, submittedBy?: string, reason = 'Listing submitted for moderation') {
  const land = await LandModel.findById(landId).lean();
  if (!land) throw new AppError('Land listing not found.', 404);
  const existing = await LandModerationModel.findOne({ landId });
  if (existing) return existing;

  const moderation = await LandModerationModel.create({
    landId,
    submittedBy: submittedBy ?? land.ownerId,
    status: land.status === 'available' ? 'published' : land.status === 'rejected' ? 'rejected' : 'pending-review',
    priority: 'medium',
    checklist: defaultChecklist(),
    documentReviews: documentReviewsFromLand(land as Land),
    timeline: [{ event: 'submitted', actorId: submittedBy ?? land.ownerId, message: reason, createdAt: new Date() }],
  });
  await createListingVersion(moderation, land, submittedBy ?? land.ownerId.toString(), reason);
  return moderation;
}

export async function listModerationQueue(query: ModerationQueueQuery) {
  const limit = Number(query.limit ?? 25);
  const filter: FilterQuery<LandModeration> = {};
  const landFilter: FilterQuery<Land> = {};

  if (query.cursor) filter._id = { $lt: query.cursor };
  if (query.status) filter.status = query.status;
  if (query.assignedModerator) filter.assignedModerator = query.assignedModerator;
  if (query.priority) filter.priority = query.priority;
  if (query.queue === 'pending') filter.status = { $in: ['pending-review', 'under-verification'] };
  if (query.queue === 'assigned') filter.assignedModerator = { $exists: true };
  if (query.queue === 'high-priority') filter.priority = { $in: ['high', 'critical'] };
  if (query.queue === 'escalated') filter.status = 'escalated';
  if (query.queue === 'rejected') filter.status = 'rejected';
  if (query.queue === 'revision') filter.status = 'needs-revision';
  if (query.queue === 'completed') filter.status = { $in: ['approved', 'published', 'rejected', 'archived', 'hidden', 'removed'] };
  if (query.createdFrom || query.createdTo) filter.createdAt = { ...(query.createdFrom ? { $gte: query.createdFrom } : {}), ...(query.createdTo ? { $lte: query.createdTo } : {}) };
  if (query.updatedFrom || query.updatedTo) filter.updatedAt = { ...(query.updatedFrom ? { $gte: query.updatedFrom } : {}), ...(query.updatedTo ? { $lte: query.updatedTo } : {}) };
  if (query.district) landFilter['location.district'] = new RegExp(escapeRegex(String(query.district)), 'i');
  if (query.crop) landFilter['landDetails.currentCrop'] = new RegExp(escapeRegex(String(query.crop)), 'i');
  if (query.q) {
    const regex = new RegExp(escapeRegex(String(query.q)), 'i');
    landFilter.$or = [{ title: regex }, { slug: regex }, { 'location.village': regex }, { 'location.district': regex }];
  }
  if (Object.keys(landFilter).length) {
    const landIds = await LandModel.find(landFilter).select('_id').limit(500).lean();
    filter.landId = { $in: landIds.map((land) => land._id) };
  }

  const raw = await LandModerationModel.find(filter).populate('landId').populate('submittedBy', 'name email role avatar').populate('assignedModerator', 'name email role avatar').sort(buildSort(query.sort)).limit(limit).lean();
  const queue = raw
    .map((item) => ({ ...item, priorityRank: priorityRank(item.priority) }))
    .sort((first, second) => (query.sort === 'priority' ? second.priorityRank - first.priorityRank : 0));
  return { queue, nextCursor: raw.at(-1)?._id?.toString() ?? null };
}

export async function getModeration(moderationId: string) {
  const moderation = await LandModerationModel.findById(moderationId)
    .populate('landId')
    .populate('submittedBy', 'name email role avatar location')
    .populate('assignedModerator', 'name email role avatar')
    .lean();
  if (!moderation) throw new AppError('Moderation record not found.', 404);
  const [decisions, assignments, versions, flags] = await Promise.all([
    ModerationDecisionModel.find({ moderationId }).populate('reviewerId', 'name email role').sort({ createdAt: -1 }).lean(),
    ModeratorAssignmentModel.find({ moderationId }).populate('moderatorId assignedBy', 'name email role').sort({ createdAt: -1 }).lean(),
    ListingVersionModel.find({ moderationId }).sort({ version: -1 }).lean(),
    ListingFlagModel.find({ moderationId }).sort({ priority: -1, createdAt: -1 }).lean(),
  ]);
  return { moderation, decisions, assignments, versions, flags };
}

export async function assignModerator(req: AuthenticatedRequest, input: { moderationId: string; moderatorId?: string; method: string; reason?: string }) {
  const moderation = await LandModerationModel.findById(input.moderationId);
  if (!moderation) throw new AppError('Moderation record not found.', 404);
  const moderatorId = input.method === 'self' ? req.user!.id : input.moderatorId;
  const moderator = await UserModel.findOne({ _id: moderatorId, role: 'admin', isActive: true }).lean();
  if (!moderator) throw new AppError('Active admin moderator not found.', 404);

  await ModeratorAssignmentModel.updateMany({ moderationId: moderation._id, active: true }, { active: false, unassignedAt: new Date() });
  await ModeratorAssignmentModel.create({ moderationId: moderation._id, landId: moderation.landId, moderatorId, assignedBy: req.user!.id, method: input.method, reason: input.reason, active: true });
  moderation.assignedModerator = new mongoose.Types.ObjectId(moderatorId) as never;
  if (moderation.status === 'pending-review') moderation.status = 'under-verification';
  moderation.timeline.push({ event: 'assigned', actorId: req.user!.id as never, message: input.reason ?? 'Listing assigned for moderation.', createdAt: new Date() });
  await moderation.save();
  await notifyOwner(moderation, req.user!.id, 'Listing assigned for review', 'Your listing has been assigned to a moderator.');
  await audit(req, 'moderation-assigned', moderation, input.reason);
  emitModerationEvent(MODERATION_SOCKET_EVENTS.LISTING_ASSIGNED, { moderationId: moderation._id.toString(), moderatorId }, moderation.submittedBy.toString());
  return { moderation };
}

export async function reviewModeration(req: AuthenticatedRequest, input: ModerationDecisionInput) {
  const moderation = await LandModerationModel.findById(input.moderationId);
  if (!moderation) throw new AppError('Moderation record not found.', 404);
  if (!moderation.reviewStartedAt) moderation.reviewStartedAt = new Date();
  moderation.checklist = input.checklist as never;
  if (input.documents?.length) moderation.documentReviews = input.documents.map((document) => ({ ...document, reviewerId: req.user!.id, reviewedAt: new Date() })) as never;
  moderation.reviewerComments = { internalNotes: input.notes, userVisibleNotes: input.userVisibleNotes };
  moderation.timeline.push({ event: 'reviewed', actorId: req.user!.id as never, message: input.notes ?? 'Moderation checklist reviewed.', createdAt: new Date() });
  await moderation.save();
  await audit(req, 'moderation-reviewed', moderation, input.notes);
  emitModerationEvent(MODERATION_SOCKET_EVENTS.QUEUE_UPDATED, { moderationId: moderation._id.toString(), status: moderation.status });
  return { moderation };
}

export async function decideModeration(req: AuthenticatedRequest, input: ModerationDecisionInput) {
  const moderation = await LandModerationModel.findById(input.moderationId);
  if (!moderation) throw new AppError('Moderation record not found.', 404);
  const land = await LandModel.findById(moderation.landId);
  if (!land) throw new AppError('Land listing not found.', 404);

  if (input.decision === 'approve' && input.checklist?.some((item) => item.result === 'fail')) {
    throw new AppError('Failed checklist items must be resolved before approval.', 400);
  }

  const previousSnapshot = land.toObject();
  const nextStatus = decisionToModerationStatus(input.decision);
  moderation.status = nextStatus;
  moderation.reviewCompletedAt = ['approved', 'rejected', 'needs-revision', 'archived', 'hidden', 'removed'].includes(nextStatus) ? new Date() : moderation.reviewCompletedAt;
  if (moderation.reviewStartedAt && moderation.reviewCompletedAt) moderation.reviewDuration = moderation.reviewCompletedAt.getTime() - moderation.reviewStartedAt.getTime();
  if (input.checklist?.length) moderation.checklist = input.checklist as never;
  if (input.documents?.length) moderation.documentReviews = input.documents.map((document) => ({ ...document, reviewerId: req.user!.id, reviewedAt: new Date() })) as never;
  moderation.reviewerComments = { internalNotes: input.notes, userVisibleNotes: input.userVisibleNotes };
  moderation.timeline.push({ event: timelineEventForDecision(input.decision), actorId: req.user!.id as never, message: input.reason, createdAt: new Date(), metadata: { decision: input.decision } });
  await moderation.save();

  land.status = moderationStatusToLandStatus(nextStatus);
  if (nextStatus === 'approved' || nextStatus === 'published') {
    land.verification.isLandVerified = true;
    land.verification.verifiedBy = new mongoose.Types.ObjectId(req.user!.id) as never;
    land.verification.verifiedAt = new Date();
    land.verification.rejectionReason = undefined;
  }
  if (nextStatus === 'rejected' || nextStatus === 'needs-revision') {
    land.verification.isLandVerified = false;
    land.verification.rejectionReason = input.reason;
  }
  await land.save();

  await ModerationDecisionModel.create({ moderationId: moderation._id, decision: input.decision, reason: input.reason, notes: input.notes, checklist: input.checklist, documents: input.documents, attachments: input.attachments, reviewerId: req.user!.id });
  await createListingVersion(moderation, land.toObject(), req.user!.id, `Moderation decision: ${input.decision}`, previousSnapshot);
  await notifyOwner(moderation, req.user!.id, notificationTitle(input.decision), input.userVisibleNotes ?? input.reason);
  await audit(req, `moderation-${input.decision}`, moderation, input.reason, asRecord(previousSnapshot), asRecord(land.toObject()));
  emitModerationEvent(MODERATION_SOCKET_EVENTS.REVIEW_COMPLETED, { moderationId: moderation._id.toString(), status: moderation.status, decision: input.decision }, moderation.submittedBy.toString());
  return { moderation, land };
}

export async function createListingFlag(req: AuthenticatedRequest, input: { landId: string; moderationId?: string; reason: string; source: string; priority: string; description?: string }) {
  const moderation = input.moderationId ? await LandModerationModel.findById(input.moderationId) : await ensureLandModeration(input.landId, req.user!.id, 'Flag created for listing.');
  if (!moderation) throw new AppError('Moderation record not found.', 404);
  const flag = await ListingFlagModel.create({ entityType: 'land', entityId: input.landId, moderationId: moderation._id, reason: input.reason, source: input.source, priority: input.priority, description: input.description, createdBy: req.user!.id });
  moderation.flagsCount = await ListingFlagModel.countDocuments({ moderationId: moderation._id, status: { $in: ['open', 'reviewing'] } });
  if (priorityRank(input.priority) > priorityRank(moderation.priority)) moderation.priority = input.priority as never;
  moderation.timeline.push({ event: 'updated', actorId: req.user!.id as never, message: `Listing flagged: ${input.reason}`, createdAt: new Date() });
  await moderation.save();
  await audit(req, 'moderation-flag-created', moderation, input.description);
  emitModerationEvent(MODERATION_SOCKET_EVENTS.QUEUE_UPDATED, { moderationId: moderation._id.toString(), flagsCount: moderation.flagsCount });
  return { flag, moderation };
}

export async function listModerationHistory(query: ModerationQueueQuery) {
  const result = await listModerationQueue({ ...query, queue: query.queue ?? 'completed' });
  return { history: result.queue, nextCursor: result.nextCursor };
}

async function createListingVersion(moderation: LandModerationDocument | LandModeration, snapshot: unknown, updatedBy: string, reason: string, previous?: unknown) {
  const version = (await ListingVersionModel.countDocuments({ entityType: 'land', entityId: moderation.landId })) + 1;
  await ListingVersionModel.create({
    entityType: 'land',
    entityId: moderation.landId,
    moderationId: '_id' in moderation ? moderation._id : undefined,
    version,
    snapshot: asRecord(snapshot),
    diff: previous ? diffObjects(asRecord(previous), asRecord(snapshot)) : [],
    updatedBy,
    reason,
  });
  await LandModerationModel.updateOne({ _id: '_id' in moderation ? moderation._id : undefined }, { currentVersion: version });
}

function diffObjects(oldValue: Record<string, unknown>, newValue: Record<string, unknown>) {
  return ['title', 'description', 'status', 'location', 'area', 'pricing', 'documents', 'verification'].flatMap((path) => {
    const oldItem = oldValue[path];
    const newItem = newValue[path];
    return JSON.stringify(oldItem) === JSON.stringify(newItem) ? [] : [{ path, oldValue: oldItem, newValue: newItem }];
  });
}

function decisionToModerationStatus(decision: string): (typeof LAND_MODERATION_STATUSES)[number] {
  const map: Record<string, (typeof LAND_MODERATION_STATUSES)[number]> = {
    approve: 'published',
    reject: 'rejected',
    'request-revision': 'needs-revision',
    escalate: 'escalated',
    archive: 'archived',
    hide: 'hidden',
    remove: 'removed',
  };
  return map[decision] ?? 'under-verification';
}

function timelineEventForDecision(decision: string) {
  const map: Record<string, LandModeration['timeline'][number]['event']> = {
    approve: 'approved',
    reject: 'rejected',
    'request-revision': 'revision-requested',
    escalate: 'escalated',
    archive: 'archived',
    hide: 'hidden',
    remove: 'removed',
  };
  return map[decision] ?? 'reviewed';
}

function notificationTitle(decision: string) {
  const map: Record<string, string> = {
    approve: 'Listing approved',
    reject: 'Listing rejected',
    'request-revision': 'Listing needs revision',
    escalate: 'Listing review escalated',
    archive: 'Listing archived',
    hide: 'Listing hidden',
    remove: 'Listing removed',
  };
  return map[decision] ?? 'Listing moderation updated';
}

async function notifyOwner(moderation: LandModerationDocument | LandModeration, senderId: string, title: string, message: string) {
  await createNotification({ receiverId: moderation.submittedBy.toString(), senderId, title, message, type: 'marketplace-moderation', category: 'moderation', priority: 'high', actionUrl: `/my-lands/${moderation.landId}`, metadata: { moderationId: '_id' in moderation ? moderation._id?.toString() : undefined, landId: moderation.landId.toString() } });
}

async function audit(req: AuthenticatedRequest, action: string, moderation: LandModerationDocument | LandModeration, reason?: string, oldValue?: Record<string, unknown>, newValue?: Record<string, unknown>) {
  await writeAdminAction(req, { action, targetType: 'land-moderation', targetId: '_id' in moderation ? moderation._id?.toString() : undefined, permissionUsed: req.adminPermission, reason, oldValue, newValue });
}
