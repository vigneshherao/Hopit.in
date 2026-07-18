import { Schema, model, type HydratedDocument } from 'mongoose';
import { LISTING_FLAG_REASONS, LISTING_FLAG_SOURCES, LISTING_FLAG_STATUSES, MODERATION_ENTITY_TYPES, MODERATION_PRIORITIES } from '@/constants/moderation.constants.js';

export interface ListingFlag {
  entityType: (typeof MODERATION_ENTITY_TYPES)[number];
  entityId: Schema.Types.ObjectId;
  moderationId?: Schema.Types.ObjectId;
  reason: (typeof LISTING_FLAG_REASONS)[number];
  source: (typeof LISTING_FLAG_SOURCES)[number];
  priority: (typeof MODERATION_PRIORITIES)[number];
  status: (typeof LISTING_FLAG_STATUSES)[number];
  description?: string;
  createdBy?: Schema.Types.ObjectId;
  resolvedBy?: Schema.Types.ObjectId;
  resolvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ListingFlagDocument = HydratedDocument<ListingFlag>;

const listingFlagSchema = new Schema<ListingFlag>(
  {
    entityType: { type: String, enum: MODERATION_ENTITY_TYPES, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    moderationId: { type: Schema.Types.ObjectId, ref: 'LandModeration', index: true },
    reason: { type: String, enum: LISTING_FLAG_REASONS, required: true, index: true },
    source: { type: String, enum: LISTING_FLAG_SOURCES, default: 'manual', index: true },
    priority: { type: String, enum: MODERATION_PRIORITIES, default: 'medium', index: true },
    status: { type: String, enum: LISTING_FLAG_STATUSES, default: 'open', index: true },
    description: { type: String, trim: true, maxlength: 2000 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
  },
  { timestamps: true },
);

listingFlagSchema.index({ entityType: 1, entityId: 1, status: 1 });
listingFlagSchema.index({ moderationId: 1, priority: 1, status: 1 });

export const ListingFlagModel = model<ListingFlag>('ListingFlag', listingFlagSchema);
