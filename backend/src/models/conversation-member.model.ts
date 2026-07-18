import { Schema, model, type HydratedDocument } from 'mongoose';
import { CHAT_NOTIFICATION_LEVELS, CONVERSATION_MEMBER_ROLES, CONVERSATION_MEMBER_STATUSES, DEFAULT_CHAT_PERMISSIONS } from '@/constants/chat.constants.js';

export interface ConversationMember {
  conversationId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  role: (typeof CONVERSATION_MEMBER_ROLES)[number];
  status: (typeof CONVERSATION_MEMBER_STATUSES)[number];
  addedBy?: Schema.Types.ObjectId;
  joinedAt?: Date;
  leftAt?: Date;
  removedAt?: Date;
  lastReadMessageId?: Schema.Types.ObjectId;
  lastReadAt?: Date;
  unreadCount: number;
  isMuted: boolean;
  mutedUntil?: Date;
  isPinned: boolean;
  isArchived: boolean;
  notificationLevel: (typeof CHAT_NOTIFICATION_LEVELS)[number];
  permissions: typeof DEFAULT_CHAT_PERMISSIONS;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ConversationMemberDocument = HydratedDocument<ConversationMember>;

const permissionSchema = new Schema(
  {
    canSendMessages: { type: Boolean, default: true },
    canUploadFiles: { type: Boolean, default: true },
    canAddMembers: { type: Boolean, default: false },
    canRemoveMembers: { type: Boolean, default: false },
    canEditConversation: { type: Boolean, default: false },
    canViewHistory: { type: Boolean, default: true },
  },
  { _id: false },
);

const conversationMemberSchema = new Schema<ConversationMember>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: CONVERSATION_MEMBER_ROLES, default: 'member', index: true },
    status: { type: String, enum: CONVERSATION_MEMBER_STATUSES, default: 'active', index: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
    removedAt: { type: Date },
    lastReadMessageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    lastReadAt: { type: Date },
    unreadCount: { type: Number, default: 0, min: 0, index: true },
    isMuted: { type: Boolean, default: false, index: true },
    mutedUntil: { type: Date },
    isPinned: { type: Boolean, default: false, index: true },
    isArchived: { type: Boolean, default: false, index: true },
    notificationLevel: { type: String, enum: CHAT_NOTIFICATION_LEVELS, default: 'all' },
    permissions: { type: permissionSchema, default: () => DEFAULT_CHAT_PERMISSIONS },
  },
  { timestamps: true },
);

conversationMemberSchema.index({ conversationId: 1, userId: 1 }, { unique: true });
conversationMemberSchema.index({ userId: 1, status: 1, isArchived: 1, isPinned: -1, updatedAt: -1 });

export const ConversationMemberModel = model<ConversationMember>('ConversationMember', conversationMemberSchema);
