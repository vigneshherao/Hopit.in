import { Schema, model, type HydratedDocument } from 'mongoose';

export interface StarredMessage {
  messageId: Schema.Types.ObjectId;
  conversationId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export type StarredMessageDocument = HydratedDocument<StarredMessage>;

const starredMessageSchema = new Schema<StarredMessage>(
  {
    messageId: { type: Schema.Types.ObjectId, ref: 'Message', required: true, index: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true },
);

starredMessageSchema.index({ messageId: 1, userId: 1 }, { unique: true });
starredMessageSchema.index({ userId: 1, createdAt: -1 });

export const StarredMessageModel = model<StarredMessage>('StarredMessage', starredMessageSchema);
