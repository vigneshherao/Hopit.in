import { Schema, model, type HydratedDocument } from 'mongoose';

export interface MessageReceipt {
  messageId: Schema.Types.ObjectId;
  conversationId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type MessageReceiptDocument = HydratedDocument<MessageReceipt>;

const messageReceiptSchema = new Schema<MessageReceipt>(
  {
    messageId: { type: Schema.Types.ObjectId, ref: 'Message', required: true, index: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deliveredAt: { type: Date },
    readAt: { type: Date },
  },
  { timestamps: true },
);

messageReceiptSchema.index({ messageId: 1, userId: 1 }, { unique: true });
messageReceiptSchema.index({ conversationId: 1, userId: 1, readAt: 1 });

export const MessageReceiptModel = model<MessageReceipt>('MessageReceipt', messageReceiptSchema);
