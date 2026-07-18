import { Schema, model, type HydratedDocument } from 'mongoose';

export interface MessageMention {
  messageId: Schema.Types.ObjectId;
  conversationId: Schema.Types.ObjectId;
  mentionedUserId: Schema.Types.ObjectId;
  mentionedBy: Schema.Types.ObjectId;
  createdAt?: Date;
}

export type MessageMentionDocument = HydratedDocument<MessageMention>;

const messageMentionSchema = new Schema<MessageMention>(
  {
    messageId: { type: Schema.Types.ObjectId, ref: 'Message', required: true, index: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    mentionedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mentionedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

messageMentionSchema.index({ messageId: 1, mentionedUserId: 1 }, { unique: true });
messageMentionSchema.index({ mentionedUserId: 1, createdAt: -1 });

export const MessageMentionModel = model<MessageMention>('MessageMention', messageMentionSchema);
