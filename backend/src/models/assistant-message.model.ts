import { Schema, model, type HydratedDocument } from 'mongoose';
import { ASSISTANT_MESSAGE_SENDERS } from '@/constants/assistant.constants.js';

export interface AssistantMessage {
  conversationId: Schema.Types.ObjectId;
  sender: (typeof ASSISTANT_MESSAGE_SENDERS)[number];
  content: string;
  tokens?: number;
  provider?: string;
  processingTime?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AssistantMessageDocument = HydratedDocument<AssistantMessage>;

const assistantMessageSchema = new Schema<AssistantMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'AssistantConversation', required: true, index: true },
    sender: { type: String, enum: ASSISTANT_MESSAGE_SENDERS, required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 6000 },
    tokens: { type: Number, min: 0 },
    provider: { type: String, trim: true },
    processingTime: { type: Number, min: 0 },
  },
  { timestamps: true },
);

assistantMessageSchema.index({ conversationId: 1, createdAt: 1 });

export const AssistantMessageModel = model<AssistantMessage>('AssistantMessage', assistantMessageSchema);

