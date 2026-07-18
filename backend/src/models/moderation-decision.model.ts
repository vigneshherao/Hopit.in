import { Schema, model, type HydratedDocument } from 'mongoose';
import { MODERATION_DECISIONS } from '@/constants/moderation.constants.js';

export interface ModerationDecision {
  moderationId: Schema.Types.ObjectId;
  decision: (typeof MODERATION_DECISIONS)[number];
  reason: string;
  notes?: string;
  checklist?: Record<string, unknown>[];
  documents?: Record<string, unknown>[];
  attachments?: string[];
  reviewerId: Schema.Types.ObjectId;
  createdAt?: Date;
}

export type ModerationDecisionDocument = HydratedDocument<ModerationDecision>;

const moderationDecisionSchema = new Schema<ModerationDecision>(
  {
    moderationId: { type: Schema.Types.ObjectId, ref: 'LandModeration', required: true, index: true },
    decision: { type: String, enum: MODERATION_DECISIONS, required: true, index: true },
    reason: { type: String, required: true, trim: true, maxlength: 1200 },
    notes: { type: String, trim: true, maxlength: 3000 },
    checklist: [{ type: Schema.Types.Mixed }],
    documents: [{ type: Schema.Types.Mixed }],
    attachments: [{ type: String, trim: true }],
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

moderationDecisionSchema.index({ moderationId: 1, createdAt: -1 });

export const ModerationDecisionModel = model<ModerationDecision>('ModerationDecision', moderationDecisionSchema);
