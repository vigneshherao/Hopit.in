import { Schema, model, type HydratedDocument } from 'mongoose';

export const REPORT_ENTITY_TYPES = ['message', 'user', 'attachment', 'conversation'] as const;
export const REPORT_REASONS = ['spam', 'harassment', 'abuse', 'fraud', 'inappropriate-content', 'other'] as const;
export const REPORT_STATUSES = ['open', 'reviewing', 'dismissed', 'resolved'] as const;

export interface ReportedItem {
  reporterId: Schema.Types.ObjectId;
  entityType: (typeof REPORT_ENTITY_TYPES)[number];
  entityId: Schema.Types.ObjectId;
  conversationId?: Schema.Types.ObjectId;
  reason: (typeof REPORT_REASONS)[number];
  description?: string;
  status: (typeof REPORT_STATUSES)[number];
  resolution?: string;
  resolvedBy?: Schema.Types.ObjectId;
  resolvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ReportedItemDocument = HydratedDocument<ReportedItem>;

const reportedItemSchema = new Schema<ReportedItem>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    entityType: { type: String, enum: REPORT_ENTITY_TYPES, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', index: true },
    reason: { type: String, enum: REPORT_REASONS, required: true, index: true },
    description: { type: String, trim: true, maxlength: 1000 },
    status: { type: String, enum: REPORT_STATUSES, default: 'open', index: true },
    resolution: { type: String, trim: true, maxlength: 1000 },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true },
);

reportedItemSchema.index({ status: 1, createdAt: -1 });
reportedItemSchema.index({ reporterId: 1, entityType: 1, entityId: 1 });

export const ReportedItemModel = model<ReportedItem>('ReportedItem', reportedItemSchema);
