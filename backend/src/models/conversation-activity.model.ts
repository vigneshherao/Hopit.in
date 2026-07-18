import { Schema, model, type HydratedDocument } from 'mongoose';

export interface ConversationActivity {
  conversationId: Schema.Types.ObjectId;
  actorId?: Schema.Types.ObjectId;
  activityType: string;
  entityType: string;
  entityId?: Schema.Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

export type ConversationActivityDocument = HydratedDocument<ConversationActivity>;

const conversationActivitySchema = new Schema<ConversationActivity>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    activityType: { type: String, required: true, trim: true, index: true },
    entityType: { type: String, required: true, trim: true, index: true },
    entityId: { type: Schema.Types.ObjectId, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

conversationActivitySchema.index({ conversationId: 1, createdAt: -1 });
conversationActivitySchema.index({ actorId: 1, createdAt: -1 });

export const ConversationActivityModel = model<ConversationActivity>('ConversationActivity', conversationActivitySchema);
