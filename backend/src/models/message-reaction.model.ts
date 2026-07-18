import { Schema, model, type HydratedDocument } from 'mongoose';
import { CHAT_REACTIONS } from '@/constants/chat.constants.js';

export interface MessageReaction {
  messageId: Schema.Types.ObjectId;
  conversationId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  emoji: (typeof CHAT_REACTIONS)[number];
  createdAt?: Date;
  updatedAt?: Date;
}

export type MessageReactionDocument = HydratedDocument<MessageReaction>;

const messageReactionSchema = new Schema<MessageReaction>(
  {
    messageId: { type: Schema.Types.ObjectId, ref: 'Message', required: true, index: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    emoji: { type: String, enum: CHAT_REACTIONS, required: true },
  },
  { timestamps: true },
);

messageReactionSchema.index({ messageId: 1, userId: 1 }, { unique: true });
messageReactionSchema.index({ conversationId: 1, createdAt: -1 });

export const MessageReactionModel = model<MessageReaction>('MessageReaction', messageReactionSchema);
