import { Schema, model, type HydratedDocument } from 'mongoose';
import { AI_HISTORY_FEATURES } from '@/constants/auth.constants.js';

export interface AIHistory {
  userId: Schema.Types.ObjectId;
  landId?: Schema.Types.ObjectId;
  feature: (typeof AI_HISTORY_FEATURES)[number];
  prompt: string;
  input?: Record<string, unknown>;
  response: unknown;
  provider?: string;
  model?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AIHistoryDocument = HydratedDocument<AIHistory>;

const aiHistorySchema = new Schema<AIHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    landId: { type: Schema.Types.ObjectId, ref: 'Land', index: true },
    feature: { type: String, enum: AI_HISTORY_FEATURES, required: true, index: true },
    prompt: { type: String, required: true, trim: true },
    input: { type: Schema.Types.Mixed },
    response: { type: Schema.Types.Mixed, required: true },
    provider: { type: String, trim: true },
    model: { type: String, trim: true },
    durationMs: { type: Number, min: 0 },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

aiHistorySchema.index({ createdAt: -1 });
aiHistorySchema.index({ userId: 1, feature: 1, createdAt: -1 });
aiHistorySchema.index({ userId: 1, landId: 1, createdAt: -1 });

export const AIHistoryModel = model<AIHistory>('AIHistory', aiHistorySchema);
