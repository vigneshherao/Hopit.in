import { z } from 'zod';
import { CHAT_ATTACHMENT_TYPES, CONVERSATION_MEMBER_ROLES, CONVERSATION_TYPES, MESSAGE_TYPES } from '@/constants/chat.constants.js';
import { env } from '@/config/env.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id.');
const safeText = z.string().trim().max(env.chatMaxMessageLength);

export const idParamSchema = z.object({ id: objectId });
export const conversationParamSchema = z.object({ conversationId: objectId });
export const messageParamSchema = z.object({ messageId: objectId });
export const attachmentParamSchema = z.object({ attachmentId: objectId });
export const userParamSchema = z.object({ userId: objectId });

export const conversationQuerySchema = z.object({
  type: z.enum(CONVERSATION_TYPES).optional(),
  unreadOnly: z.coerce.boolean().optional(),
  archived: z.coerce.boolean().optional(),
  pinned: z.coerce.boolean().optional(),
  muted: z.coerce.boolean().optional(),
  farmPlanId: objectId.optional(),
  agreementId: objectId.optional(),
  taskId: objectId.optional(),
  search: z.string().trim().max(120).optional(),
  cursor: objectId.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const messageQuerySchema = z.object({
  cursor: objectId.optional(),
  beforeMessageId: objectId.optional(),
  afterMessageId: objectId.optional(),
  type: z.enum(MESSAGE_TYPES).optional(),
  senderId: objectId.optional(),
  search: z.string().trim().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(60).default(30),
});

export const directConversationSchema = z.object({ participantId: objectId });
export const chatUserDirectoryQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  role: z.enum(['owner', 'farmer', 'worker', 'admin']).optional(),
  limit: z.coerce.number().int().min(1).max(30).default(12),
});
export const groupConversationSchema = z.object({
  title: z.string().trim().min(2).max(160),
  participantIds: z.array(objectId).min(2).max(env.chatMaxGroupMembers),
  description: z.string().trim().max(800).optional(),
});

export const conversationUpdateSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(800).optional(),
  avatarUrl: z.string().trim().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const addMembersSchema = z.object({
  userIds: z.array(objectId).min(1).max(25),
  role: z.enum(CONVERSATION_MEMBER_ROLES).default('member'),
});

export const updateMemberSchema = z.object({
  role: z.enum(CONVERSATION_MEMBER_ROLES).optional(),
  permissions: z.object({
    canSendMessages: z.boolean().optional(),
    canUploadFiles: z.boolean().optional(),
    canAddMembers: z.boolean().optional(),
    canRemoveMembers: z.boolean().optional(),
    canEditConversation: z.boolean().optional(),
    canViewHistory: z.boolean().optional(),
  }).optional(),
});

export const messageCreateSchema = z.object({
  type: z.enum(MESSAGE_TYPES).default('text'),
  text: safeText.optional(),
  attachmentIds: z.array(objectId).max(env.chatMaxAttachmentsPerMessage).optional(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    label: z.string().trim().max(120).optional(),
    address: z.string().trim().max(300).optional(),
    accuracyMeters: z.number().min(0).optional(),
  }).optional(),
  replyToMessageId: objectId.optional(),
  forwardedFromMessageId: objectId.optional(),
  clientMessageId: z.string().trim().min(4).max(120).optional(),
}).refine((value) => Boolean(value.text?.trim() || value.attachmentIds?.length || value.location), 'Message cannot be empty.');

export const messageEditSchema = z.object({ text: safeText.min(1) });
export const messageDeleteSchema = z.object({ scope: z.enum(['self', 'everyone']).default('self') });
export const messageForwardSchema = z.object({ conversationIds: z.array(objectId).min(1).max(5) });
export const readReceiptSchema = z.object({ lastReadMessageId: objectId.optional() });
export const deliveredSchema = z.object({ conversationId: objectId.optional() });
export const muteSchema = z.object({ duration: z.enum(['1-hour', '8-hours', '1-day', '1-week', 'forever']).default('1-day') });
export const blockUserSchema = z.object({ reason: z.string().trim().max(300).optional() });

export const attachmentMetadataSchema = z.object({
  type: z.enum(CHAT_ATTACHMENT_TYPES),
});

export const chatSearchQuerySchema = z.object({
  q: z.string().trim().min(1).max(120),
  type: z.enum(CONVERSATION_TYPES).optional(),
  conversationId: objectId.optional(),
  senderId: objectId.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  cursor: objectId.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
