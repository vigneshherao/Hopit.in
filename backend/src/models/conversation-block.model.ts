import { Schema, model, type HydratedDocument } from 'mongoose';

export interface ConversationBlock {
  blockerId: Schema.Types.ObjectId;
  blockedUserId: Schema.Types.ObjectId;
  conversationId?: Schema.Types.ObjectId;
  reason?: string;
  createdAt?: Date;
}

export type ConversationBlockDocument = HydratedDocument<ConversationBlock>;

const conversationBlockSchema = new Schema<ConversationBlock>(
  {
    blockerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    blockedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', index: true },
    reason: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

conversationBlockSchema.index({ blockerId: 1, blockedUserId: 1 }, { unique: true });

export const ConversationBlockModel = model<ConversationBlock>('ConversationBlock', conversationBlockSchema);
