import type mongoose from 'mongoose';
import type { FilterQuery } from 'mongoose';
import { ActivityFeedModel, type ActivityFeed } from '@/models/activity-feed.model.js';
import { emitActivity } from '@/services/activity/activity.socket.js';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function mapActivity(activity: unknown) {
  const record = activity as Record<string, unknown> & { _id?: { toString(): string }; userId?: { toString(): string }; actorId?: { toString(): string }; entityId?: { toString(): string } };
  return {
    ...record,
    id: record._id?.toString(),
    _id: record._id?.toString(),
    userId: record.userId?.toString(),
    actorId: record.actorId?.toString(),
    entityId: record.entityId?.toString(),
  };
}

function dateFilter(date?: string) {
  if (!date) return undefined;
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  if (date === 'today') start.setHours(0, 0, 0, 0);
  if (date === 'yesterday') {
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
  }
  if (date === 'this-week') start.setDate(start.getDate() - 7);
  if (date === 'this-month') start.setMonth(start.getMonth() - 1);
  return { $gte: start, $lte: date === 'yesterday' ? end : now };
}

export async function createActivity(input: {
  userId: string | mongoose.Types.ObjectId;
  actorId?: string | mongoose.Types.ObjectId;
  entityType: string;
  entityId?: string | mongoose.Types.ObjectId;
  action: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  visibility?: ActivityFeed['visibility'];
  dedupeKey?: string;
}) {
  const update = {
    ...input,
    visibility: input.visibility ?? 'private',
  };
  const activity = input.dedupeKey
    ? await ActivityFeedModel.findOneAndUpdate({ dedupeKey: input.dedupeKey }, { $setOnInsert: update }, { upsert: true, new: true })
    : await ActivityFeedModel.create(update);
  const mapped = mapActivity(activity.toObject());
  emitActivity(input.userId.toString(), mapped);
  return mapped;
}

export async function listActivities(userId: string, query: Record<string, unknown> = {}) {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 20);
  const filter: FilterQuery<ActivityFeed> = { userId };
  if (query.entityType) filter.entityType = query.entityType;
  if (query.entityId) filter.entityId = query.entityId;
  if (query.action) filter.action = query.action;
  if (query.visibility) filter.visibility = query.visibility;
  const createdAt = dateFilter(query.date as string | undefined);
  if (createdAt) filter.createdAt = createdAt;
  if (query.search) {
    const regex = new RegExp(escapeRegex(String(query.search)), 'i');
    filter.$or = [{ title: regex }, { description: regex }, { action: regex }, { entityType: regex }];
  }

  const [activities, total] = await Promise.all([
    ActivityFeedModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ActivityFeedModel.countDocuments(filter),
  ]);
  return { activities: activities.map(mapActivity), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
}

export async function listEntityActivities(userId: string, entityType: string, entityId: string, query: Record<string, unknown> = {}) {
  return listActivities(userId, { ...query, entityType, entityId });
}
