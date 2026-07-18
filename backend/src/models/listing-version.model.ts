import { Schema, model, type HydratedDocument } from 'mongoose';
import { MODERATION_ENTITY_TYPES } from '@/constants/moderation.constants.js';

export interface ListingVersion {
  entityType: (typeof MODERATION_ENTITY_TYPES)[number];
  entityId: Schema.Types.ObjectId;
  moderationId?: Schema.Types.ObjectId;
  version: number;
  snapshot: Record<string, unknown>;
  diff: { path: string; oldValue?: unknown; newValue?: unknown }[];
  updatedBy: Schema.Types.ObjectId;
  reason: string;
  createdAt?: Date;
}

export type ListingVersionDocument = HydratedDocument<ListingVersion>;

const listingVersionSchema = new Schema<ListingVersion>(
  {
    entityType: { type: String, enum: MODERATION_ENTITY_TYPES, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    moderationId: { type: Schema.Types.ObjectId, ref: 'LandModeration', index: true },
    version: { type: Number, required: true, min: 1 },
    snapshot: { type: Schema.Types.Mixed, required: true },
    diff: [{ type: Schema.Types.Mixed }],
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reason: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

listingVersionSchema.index({ entityType: 1, entityId: 1, version: -1 }, { unique: true });
listingVersionSchema.pre('updateOne', function preventUpdate() { throw new Error('Listing versions are immutable.'); });
listingVersionSchema.pre('deleteOne', function preventDelete() { throw new Error('Listing versions are immutable.'); });

export const ListingVersionModel = model<ListingVersion>('ListingVersion', listingVersionSchema);
