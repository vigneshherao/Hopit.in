import { Schema, model, type HydratedDocument } from 'mongoose';

export interface PinnedMessage {
  conversationId: Schema.Types.ObjectId;
  messageId: Schema.Types.ObjectId;
  pinnedBy: Schema.Types.ObjectId;
  pinnedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PinnedMessageDocument = HydratedDocument<PinnedMessage>;

const pinnedMessageSchema = new Schema<PinnedMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    messageId: { type: Schema.Types.ObjectId, ref: 'Message', required: true, index: true },
    pinnedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    pinnedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

pinnedMessageSchema.index({ conversationId: 1, messageId: 1 }, { unique: true });
pinnedMessageSchema.index({ conversationId: 1, pinnedAt: -1 });

export const PinnedMessageModel = model<PinnedMessage>('PinnedMessage', pinnedMessageSchema);
