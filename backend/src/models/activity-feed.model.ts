import { Schema, model, type HydratedDocument } from 'mongoose';
import { ACTIVITY_VISIBILITIES } from '@/constants/realtime.constants.js';

export interface ActivityFeed {
  userId: Schema.Types.ObjectId;
  actorId?: Schema.Types.ObjectId;
  entityType: string;
  entityId?: Schema.Types.ObjectId;
  action: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  visibility: (typeof ACTIVITY_VISIBILITIES)[number];
  readBy: Schema.Types.ObjectId[];
  dedupeKey?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ActivityFeedDocument = HydratedDocument<ActivityFeed>;

const activityFeedSchema = new Schema<ActivityFeed>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    entityType: { type: String, required: true, trim: true, index: true },
    entityId: { type: Schema.Types.ObjectId, index: true },
    action: { type: String, required: true, trim: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, trim: true, maxlength: 700 },
    metadata: { type: Schema.Types.Mixed },
    visibility: { type: String, enum: ACTIVITY_VISIBILITIES, default: 'private', index: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    dedupeKey: { type: String, trim: true, sparse: true, unique: true },
  },
  { timestamps: true },
);

activityFeedSchema.index({ userId: 1, createdAt: -1 });
activityFeedSchema.index({ title: 'text', description: 'text', action: 'text', entityType: 'text' });

export const ActivityFeedModel = model<ActivityFeed>('ActivityFeed', activityFeedSchema);
