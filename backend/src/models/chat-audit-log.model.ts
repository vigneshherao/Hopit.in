import { Schema, model, type HydratedDocument } from 'mongoose';
import { CHAT_AUDIT_ACTIONS } from '@/constants/chat.constants.js';

export interface ChatAuditLog {
  conversationId?: Schema.Types.ObjectId;
  messageId?: Schema.Types.ObjectId;
  actorId: Schema.Types.ObjectId;
  action: (typeof CHAT_AUDIT_ACTIONS)[number];
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

export type ChatAuditLogDocument = HydratedDocument<ChatAuditLog>;

const chatAuditLogSchema = new Schema<ChatAuditLog>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', index: true },
    messageId: { type: Schema.Types.ObjectId, ref: 'Message', index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, enum: CHAT_AUDIT_ACTIONS, required: true, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

chatAuditLogSchema.index({ conversationId: 1, createdAt: -1 });

export const ChatAuditLogModel = model<ChatAuditLog>('ChatAuditLog', chatAuditLogSchema);
