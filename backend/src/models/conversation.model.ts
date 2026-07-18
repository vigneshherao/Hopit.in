import { Schema, model, type HydratedDocument } from 'mongoose';
import { CONVERSATION_TYPES } from '@/constants/chat.constants.js';

export interface Conversation {
  type: (typeof CONVERSATION_TYPES)[number];
  title?: string;
  description?: string;
  avatarUrl?: string;
  createdBy: Schema.Types.ObjectId;
  farmPlanId?: Schema.Types.ObjectId;
  landId?: Schema.Types.ObjectId;
  agreementId?: Schema.Types.ObjectId;
  taskId?: Schema.Types.ObjectId;
  workerId?: Schema.Types.ObjectId;
  managerId?: Schema.Types.ObjectId;
  adminSupportTicketId?: Schema.Types.ObjectId;
  directParticipantKey?: string;
  memberCount: number;
  lastMessageId?: Schema.Types.ObjectId;
  lastMessagePreview?: string;
  lastMessageAt?: Date;
  lastMessageSenderId?: Schema.Types.ObjectId;
  isActive: boolean;
  isArchivedGlobally: boolean;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ConversationDocument = HydratedDocument<Conversation>;

const conversationSchema = new Schema<Conversation>(
  {
    type: { type: String, enum: CONVERSATION_TYPES, required: true, index: true },
    title: { type: String, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 800 },
    avatarUrl: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farmPlanId: { type: Schema.Types.ObjectId, ref: 'FarmPlan', sparse: true, index: true },
    landId: { type: Schema.Types.ObjectId, ref: 'Land', sparse: true, index: true },
    agreementId: { type: Schema.Types.ObjectId, ref: 'Agreement', sparse: true, index: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'FarmTask', sparse: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'User', sparse: true },
    managerId: { type: Schema.Types.ObjectId, ref: 'User', sparse: true },
    adminSupportTicketId: { type: Schema.Types.ObjectId, sparse: true },
    directParticipantKey: { type: String, trim: true, sparse: true, unique: true },
    memberCount: { type: Number, default: 0, min: 0 },
    lastMessageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    lastMessagePreview: { type: String, trim: true, maxlength: 240 },
    lastMessageAt: { type: Date, index: true },
    lastMessageSenderId: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true, index: true },
    isArchivedGlobally: { type: Boolean, default: false, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

conversationSchema.index({ type: 1, lastMessageAt: -1 });
conversationSchema.index({ farmPlanId: 1, type: 1 }, { unique: true, sparse: true });
conversationSchema.index({ agreementId: 1, type: 1 }, { unique: true, sparse: true });
conversationSchema.index({ taskId: 1, type: 1 }, { unique: true, sparse: true });
conversationSchema.index({ title: 'text', description: 'text', lastMessagePreview: 'text' });

export const ConversationModel = model<Conversation>('Conversation', conversationSchema);
