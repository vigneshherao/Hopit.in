import mongoose, { type FilterQuery } from 'mongoose';
import { DEFAULT_CHAT_PERMISSIONS } from '@/constants/chat.constants.js';
import { env } from '@/config/env.js';
import { ChatLocationModel } from '@/models/chat-location.model.js';
import { AnnouncementModel } from '@/models/announcement.model.js';
import { ConversationBlockModel } from '@/models/conversation-block.model.js';
import { ConversationMemberModel } from '@/models/conversation-member.model.js';
import { ConversationModel, type Conversation } from '@/models/conversation.model.js';
import { MessageReceiptModel } from '@/models/message-receipt.model.js';
import { MessageModel, type Message } from '@/models/message.model.js';
import { MessageReactionModel } from '@/models/message-reaction.model.js';
import { ChatAttachmentModel } from '@/models/chat-attachment.model.js';
import { UserModel } from '@/models/user.model.js';
import { SharedNoteModel } from '@/models/shared-note.model.js';
import { auditChat } from '@/services/chat/chat.audit.service.js';
import { mapConversation, mapMember, mapMessage } from '@/services/chat/chat.mapper.js';
import { ensureNotBlocked, getActiveMember, requireManageMembers, requireSendPermission } from '@/services/chat/chat.permissions.js';
import { emitChatMessage, emitChatUnread, emitChatUpdate } from '@/services/chat/chat.socket.js';
import { notifyConversationMembers } from '@/services/chat/chat.notification.service.js';
import { createMentionsFromText } from '@/services/chat/chat.mention.service.js';
import { recordConversationActivity } from '@/services/chat/chat.enterprise.service.js';
import { writeAuditLog } from '@/services/chat/chat.audit-log.service.js';
import { createActivity } from '@/services/activity/activity.service.js';
import { AppError } from '@/utils/app-error.js';

export { deleteChatAttachment, getChatAttachment, uploadChatAttachments } from '@/services/chat/chatMedia.service.js';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeText(text?: string): string | undefined {
  return text?.replace(/\s+/g, ' ').trim();
}

function previewFor(input: { type: string; text?: string }): string {
  if (input.text) return normalizeText(input.text)?.slice(0, 180) ?? '';
  if (input.type === 'location') return 'Shared a location';
  if (input.type === 'image') return 'Shared an image';
  if (input.type === 'document') return 'Shared a document';
  if (input.type === 'voice') return 'Shared a voice note';
  return 'New message';
}

function directKey(a: string, b: string): string {
  return [a, b].sort().join(':');
}

function ownerPermissions() {
  return { ...DEFAULT_CHAT_PERMISSIONS, canAddMembers: true, canRemoveMembers: true, canEditConversation: true };
}

async function createMember(conversationId: string, userId: string, role: string, addedBy: string, permissions = DEFAULT_CHAT_PERMISSIONS) {
  return ConversationMemberModel.findOneAndUpdate(
    { conversationId, userId },
    { $set: { role, status: 'active', permissions }, $setOnInsert: { addedBy, joinedAt: new Date(), unreadCount: 0 } },
    { new: true, upsert: true },
  );
}

async function refreshMemberCount(conversationId: string) {
  const memberCount = await ConversationMemberModel.countDocuments({ conversationId, status: 'active' });
  await ConversationModel.findByIdAndUpdate(conversationId, { memberCount });
}

export async function createDirectConversation(userId: string, participantId: string) {
  if (userId === participantId) throw new AppError('You cannot start a conversation with yourself.', 400);
  const key = directKey(userId, participantId);
  const blocked = await ConversationBlockModel.findOne({
    $or: [
      { blockerId: userId, blockedUserId: participantId },
      { blockerId: participantId, blockedUserId: userId },
    ],
  }).lean();
  if (blocked) throw new AppError('Direct messages are blocked for this user.', 403);

  const conversation = await ConversationModel.findOneAndUpdate(
    { directParticipantKey: key },
    { $setOnInsert: { type: 'direct', createdBy: userId, directParticipantKey: key, memberCount: 2, isActive: true, isArchivedGlobally: false } },
    { new: true, upsert: true },
  );
  await Promise.all([
    createMember(conversation._id.toString(), userId, 'owner', userId, ownerPermissions()),
    createMember(conversation._id.toString(), participantId, 'member', userId),
  ]);
  await auditChat({ conversationId: conversation._id.toString(), actorId: userId, action: 'conversation-created', metadata: { type: 'direct' } });
  return { conversation: mapConversation(conversation.toObject()) };
}

export async function listChatUsers(userId: string, query: Record<string, unknown>) {
  const limit = Math.min(Number(query.limit ?? 12), 30);
  const filter: FilterQuery<unknown> = { _id: { $ne: userId }, isActive: true };

  if (query.role) filter.role = query.role;
  if (query.search) {
    const regex = new RegExp(escapeRegex(String(query.search)), 'i');
    filter.$or = [
      { name: regex },
      { role: regex },
      { 'location.city': regex },
      { 'location.district': regex },
      { 'location.state': regex },
    ];
  }

  const users = await UserModel.find(filter)
    .select('name role avatar location.city location.district location.state isEmailVerified isPhoneVerified lastLoginAt')
    .sort({ lastLoginAt: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  return {
    users: users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      location: user.location,
      isVerified: Boolean(user.isEmailVerified || user.isPhoneVerified),
      lastLoginAt: user.lastLoginAt,
    })),
  };
}

export async function createGroupConversation(userId: string, input: { title: string; participantIds: string[]; description?: string }) {
  const uniqueIds = [...new Set(input.participantIds.filter((id) => id !== userId))];
  if (uniqueIds.length < 2) throw new AppError('Group conversations require at least three members including you.', 400);
  const conversation = await ConversationModel.create({ type: 'custom-group', title: input.title, description: input.description, createdBy: userId, memberCount: uniqueIds.length + 1, isActive: true, isArchivedGlobally: false });
  await createMember(conversation._id.toString(), userId, 'owner', userId, ownerPermissions());
  await Promise.all(uniqueIds.map((id) => createMember(conversation._id.toString(), id, 'member', userId)));
  await auditChat({ conversationId: conversation._id.toString(), actorId: userId, action: 'conversation-created', metadata: { type: 'custom-group' } });
  return { conversation: mapConversation(conversation.toObject()) };
}

export async function listConversations(userId: string, query: Record<string, unknown>) {
  const limit = Number(query.limit ?? 20);
  const memberFilter: FilterQuery<Conversation> = { userId, status: 'active' };
  if (query.archived !== undefined) memberFilter.isArchived = query.archived;
  if (query.pinned !== undefined) memberFilter.isPinned = query.pinned;
  if (query.muted !== undefined) memberFilter.isMuted = query.muted;
  if (query.unreadOnly) memberFilter.unreadCount = { $gt: 0 };
  const memberships = await ConversationMemberModel.find(memberFilter).select('conversationId unreadCount isPinned isMuted isArchived mutedUntil').lean();
  const ids = memberships.map((member) => member.conversationId);
  const meta = new Map(memberships.map((member) => [member.conversationId.toString(), member]));
  const filter: FilterQuery<Conversation> = { _id: { $in: ids }, isActive: true };
  if (query.type) filter.type = query.type;
  if (query.farmPlanId) filter.farmPlanId = query.farmPlanId;
  if (query.agreementId) filter.agreementId = query.agreementId;
  if (query.taskId) filter.taskId = query.taskId;
  if (query.cursor) filter._id = { $in: ids, $lt: query.cursor };
  if (query.search) {
    const regex = new RegExp(escapeRegex(String(query.search)), 'i');
    filter.$or = [{ title: regex }, { description: regex }, { lastMessagePreview: regex }];
  }
  const conversations = await ConversationModel.find(filter).sort({ lastMessageAt: -1, createdAt: -1 }).limit(limit).lean();
  return {
    conversations: conversations.map((conversation) => ({ ...mapConversation(conversation), member: meta.get(conversation._id.toString()) })),
    nextCursor: conversations.at(-1)?._id?.toString() ?? null,
  };
}

export async function getConversation(conversationId: string, userId: string) {
  const member = await getActiveMember(conversationId, userId);
  const conversation = await ConversationModel.findById(conversationId).lean();
  if (!conversation) throw new AppError('Conversation not found.', 404);
  return { conversation: { ...mapConversation(conversation), member: mapMember(member.toObject()) } };
}

export async function updateConversation(conversationId: string, userId: string, payload: Record<string, unknown>) {
  const member = await getActiveMember(conversationId, userId);
  if (!member.permissions.canEditConversation) throw new AppError('You cannot edit this conversation.', 403);
  const conversation = await ConversationModel.findByIdAndUpdate(conversationId, { $set: payload }, { new: true });
  if (!conversation) throw new AppError('Conversation not found.', 404);
  await auditChat({ conversationId, actorId: userId, action: 'conversation-renamed', metadata: payload });
  return { conversation: mapConversation(conversation.toObject()) };
}

export async function setConversationFlag(conversationId: string, userId: string, flag: 'isArchived' | 'isPinned' | 'isMuted', value: boolean, mutedUntil?: Date) {
  const member = await getActiveMember(conversationId, userId);
  member.set(flag, value);
  if (flag === 'isMuted') member.mutedUntil = mutedUntil;
  await member.save();
  await auditChat({ conversationId, actorId: userId, action: value ? 'conversation-archived' : 'conversation-unarchived', metadata: { flag, value } });
  return { member: mapMember(member.toObject()) };
}

export async function listMembers(conversationId: string, userId: string) {
  await getActiveMember(conversationId, userId);
  const members = await ConversationMemberModel.find({ conversationId }).populate('userId', 'name avatar role location.city').lean();
  return { members };
}

export async function addMembers(conversationId: string, userId: string, userIds: string[], role = 'member') {
  await requireManageMembers(conversationId, userId);
  await Promise.all(userIds.map((id) => createMember(conversationId, id, role, userId)));
  await refreshMemberCount(conversationId);
  await auditChat({ conversationId, actorId: userId, action: 'member-added', metadata: { userIds, role } });
  return listMembers(conversationId, userId);
}

export async function updateMember(conversationId: string, actorId: string, userId: string, payload: { role?: string; permissions?: Partial<typeof DEFAULT_CHAT_PERMISSIONS> }) {
  await requireManageMembers(conversationId, actorId);
  const target = await ConversationMemberModel.findOne({ conversationId, userId, status: 'active' });
  if (!target) throw new AppError('Member not found.', 404);
  if (target.role === 'owner' && payload.role && payload.role !== 'owner') throw new AppError('Conversation owner role cannot be changed.', 400);

  if (payload.role) target.role = payload.role as never;
  if (payload.permissions) {
    target.permissions = {
      ...(target.permissions as unknown as Record<string, boolean>),
      ...payload.permissions,
    } as typeof DEFAULT_CHAT_PERMISSIONS;
  }

  await target.save();
  await auditChat({ conversationId, actorId, action: 'member-updated', metadata: { userId, role: payload.role, permissions: payload.permissions } });
  return { member: mapMember(target.toObject()) };
}

export async function removeMember(conversationId: string, actorId: string, userId: string) {
  await requireManageMembers(conversationId, actorId);
  const target = await ConversationMemberModel.findOne({ conversationId, userId });
  if (!target) throw new AppError('Member not found.', 404);
  if (target.role === 'owner') throw new AppError('Conversation owner cannot be removed.', 400);
  target.status = 'removed';
  target.removedAt = new Date();
  await target.save();
  await refreshMemberCount(conversationId);
  await auditChat({ conversationId, actorId, action: 'member-removed', metadata: { userId } });
  return { removed: true };
}

export async function listMessages(conversationId: string, userId: string, query: Record<string, unknown>) {
  await getActiveMember(conversationId, userId);
  const limit = Number(query.limit ?? 30);
  const filter: FilterQuery<Message> = { conversationId, deletedForUserIds: { $ne: userId } };
  if (query.cursor) filter._id = { $lt: query.cursor };
  if (query.type) filter.type = query.type;
  if (query.senderId) filter.senderId = query.senderId;
  if (query.search) filter.normalizedText = new RegExp(escapeRegex(String(query.search)), 'i');
  const messages = await MessageModel.find(filter).sort({ createdAt: -1 }).limit(limit).populate('attachments').populate('locationId').lean();
  const messageIds = messages.map((message) => message._id);
  const reactions = await MessageReactionModel.find({ messageId: { $in: messageIds } }).lean();
  const reactionsByMessage = new Map<string, typeof reactions>();
  reactions.forEach((reaction) => {
    const key = reaction.messageId.toString();
    reactionsByMessage.set(key, [...(reactionsByMessage.get(key) ?? []), reaction]);
  });
  return {
    messages: messages.reverse().map((message) => ({ ...mapMessage(message), reactions: reactionsByMessage.get(message._id.toString()) ?? [] })),
    nextCursor: messages.at(-1)?._id?.toString() ?? null,
  };
}

export async function getMessage(messageId: string, userId: string) {
  const message = await MessageModel.findById(messageId).populate('attachments').populate('locationId').lean();
  if (!message) throw new AppError('Message not found.', 404);
  await getActiveMember(message.conversationId.toString(), userId);
  return { message: mapMessage(message) };
}

export async function sendMessage(conversationId: string, userId: string, input: { type: Message['type']; text?: string; attachmentIds?: string[]; location?: { latitude: number; longitude: number; label?: string; address?: string; accuracyMeters?: number }; replyToMessageId?: string; forwardedFromMessageId?: string; threadRootMessageId?: string; clientMessageId?: string }) {
  await requireSendPermission(conversationId, userId);
  await ensureNotBlocked(conversationId, userId);
  if (input.clientMessageId) {
    const existing = await MessageModel.findOne({ senderId: userId, clientMessageId: input.clientMessageId }).populate('attachments').populate('locationId').lean();
    if (existing) return { message: mapMessage(existing), duplicate: true };
  }
  if (input.type === 'system') throw new AppError('System messages cannot be sent by clients.', 403);
  if (input.replyToMessageId) {
    const reply = await MessageModel.findOne({ _id: input.replyToMessageId, conversationId }).lean();
    if (!reply) throw new AppError('Reply message not found in this conversation.', 400);
  }
  const attachmentIds = input.attachmentIds ?? [];
  if (attachmentIds.length) {
    const count = await ChatAttachmentModel.countDocuments({ _id: { $in: attachmentIds }, conversationId, uploadedBy: userId });
    if (count !== attachmentIds.length) throw new AppError('One or more attachments are invalid.', 400);
  }
  let locationId: mongoose.Types.ObjectId | undefined;
  if (input.location) {
    const location = await ChatLocationModel.create({ ...input.location, conversationId, sharedBy: userId, sharedAt: new Date() });
    locationId = location._id;
  }
  const normalizedText = normalizeText(input.text);
  const message = await MessageModel.create({ conversationId, senderId: userId, type: input.type, text: normalizedText, normalizedText, attachments: attachmentIds, locationId, replyToMessageId: input.replyToMessageId, forwardedFromMessageId: input.forwardedFromMessageId, threadRootMessageId: input.threadRootMessageId, clientMessageId: input.clientMessageId, status: 'sent' });
  if (locationId) await ChatLocationModel.findByIdAndUpdate(locationId, { messageId: message._id });
  if (attachmentIds.length) await ChatAttachmentModel.updateMany({ _id: { $in: attachmentIds } }, { messageId: message._id });

  const preview = previewFor({ type: input.type, text: normalizedText });
  await ConversationModel.findByIdAndUpdate(conversationId, { lastMessageId: message._id, lastMessagePreview: preview, lastMessageAt: message.createdAt, lastMessageSenderId: userId });
  const members = await ConversationMemberModel.find({ conversationId, status: 'active', userId: { $ne: userId } });
  await Promise.all([
    ...members.map((member) => ConversationMemberModel.updateOne({ _id: member._id }, { $inc: { unreadCount: 1 } })),
    ...members.map((member) => MessageReceiptModel.findOneAndUpdate({ messageId: message._id, userId: member.userId }, { conversationId, deliveredAt: new Date() }, { upsert: true, new: true })),
  ]);
  const hydrated = await MessageModel.findById(message._id).populate('attachments').populate('locationId').lean();
  const mapped = mapMessage(hydrated);
  await createMentionsFromText({ conversationId, messageId: message._id.toString(), mentionedBy: userId, text: normalizedText });
  emitChatMessage(conversationId, mapped);
  emitChatUnread(conversationId, { conversationId });
  await notifyConversationMembers({ conversationId, senderId: userId, title: 'New chat message', preview });
  await recordConversationActivity({ conversationId, actorId: userId, activityType: 'message-sent', entityType: 'message', entityId: message._id.toString(), metadata: { preview, type: input.type } });
  await writeAuditLog({ userId, action: 'message-sent', entity: 'message', entityId: message._id.toString(), newValue: { conversationId, type: input.type } });
  await createActivity({ userId, actorId: userId, entityType: 'chat', entityId: new mongoose.Types.ObjectId(conversationId), action: 'message-sent', title: 'Sent a chat message', description: preview, visibility: 'private', dedupeKey: input.clientMessageId ? `chat-${userId}-${input.clientMessageId}` : undefined });
  return { message: mapped, temporaryId: input.clientMessageId };
}

export async function editMessage(messageId: string, userId: string, text: string) {
  const message = await MessageModel.findById(messageId);
  if (!message) throw new AppError('Message not found.', 404);
  await getActiveMember(message.conversationId.toString(), userId);
  if (message.senderId.toString() !== userId) throw new AppError('Only the sender can edit this message.', 403);
  if (message.type !== 'text') throw new AppError('Only text messages can be edited.', 400);
  if (Date.now() - message.createdAt!.getTime() > env.chatMessageEditWindowMinutes * 60_000) throw new AppError('Message edit window has expired.', 400);
  message.text = normalizeText(text);
  message.normalizedText = message.text;
  message.editedAt = new Date();
  message.editVersion += 1;
  await message.save();
  await auditChat({ conversationId: message.conversationId.toString(), messageId, actorId: userId, action: 'message-edited' });
  await recordConversationActivity({ conversationId: message.conversationId.toString(), actorId: userId, activityType: 'message-edited', entityType: 'message', entityId: messageId });
  await writeAuditLog({ userId, action: 'message-edited', entity: 'message', entityId: messageId, newValue: { text: message.text } });
  const mapped = mapMessage(message.toObject());
  emitChatUpdate(message.conversationId.toString(), mapped);
  return { message: mapped };
}

export async function deleteMessage(messageId: string, userId: string, scope: 'self' | 'everyone') {
  const message = await MessageModel.findById(messageId);
  if (!message) throw new AppError('Message not found.', 404);
  await getActiveMember(message.conversationId.toString(), userId);
  if (scope === 'self') {
    await MessageModel.updateOne({ _id: messageId }, { $addToSet: { deletedForUserIds: userId } });
    return { deleted: true, scope };
  }
  if (message.senderId.toString() !== userId) throw new AppError('Only the sender can delete this message for everyone.', 403);
  if (message.type === 'system') throw new AppError('System messages cannot be deleted by users.', 400);
  if (Date.now() - message.createdAt!.getTime() > env.chatDeleteForEveryoneWindowMinutes * 60_000) throw new AppError('Delete window has expired.', 400);
  message.text = '';
  message.normalizedText = '';
  message.isDeletedForEveryone = true;
  message.deletedForEveryoneAt = new Date();
  message.deletedBy = userId as never;
  await message.save();
  await auditChat({ conversationId: message.conversationId.toString(), messageId, actorId: userId, action: 'message-deleted' });
  await recordConversationActivity({ conversationId: message.conversationId.toString(), actorId: userId, activityType: 'message-deleted', entityType: 'message', entityId: messageId });
  await writeAuditLog({ userId, action: 'message-deleted', entity: 'message', entityId: messageId, newValue: { scope } });
  const mapped = mapMessage(message.toObject());
  emitChatUpdate(message.conversationId.toString(), mapped);
  return { message: mapped, scope };
}

export async function forwardMessage(messageId: string, userId: string, conversationIds: string[]) {
  const original = await MessageModel.findById(messageId).lean();
  if (!original || original.isDeletedForEveryone) throw new AppError('Message not found.', 404);
  await getActiveMember(original.conversationId.toString(), userId);
  const results = [];
  for (const conversationId of conversationIds) {
    const result = await sendMessage(conversationId, userId, { type: original.type, text: original.text, forwardedFromMessageId: messageId });
    results.push(result.message);
  }
  return { messages: results };
}

export async function markConversationRead(conversationId: string, userId: string, lastReadMessageId?: string) {
  await getActiveMember(conversationId, userId);
  const lastMessage = lastReadMessageId ? await MessageModel.findOne({ _id: lastReadMessageId, conversationId }).lean() : await MessageModel.findOne({ conversationId }).sort({ createdAt: -1 }).lean();
  await ConversationMemberModel.updateOne({ conversationId, userId }, { unreadCount: 0, lastReadMessageId: lastMessage?._id, lastReadAt: new Date() });
  await MessageReceiptModel.updateMany({ conversationId, userId, readAt: { $exists: false } }, { readAt: new Date(), deliveredAt: new Date() });
  emitChatUnread(conversationId, { conversationId, userId, unreadCount: 0 });
  return { read: true };
}

export async function markDelivered(messageId: string, userId: string) {
  const message = await MessageModel.findById(messageId).lean();
  if (!message) throw new AppError('Message not found.', 404);
  await getActiveMember(message.conversationId.toString(), userId);
  const receipt = await MessageReceiptModel.findOneAndUpdate({ messageId, userId }, { conversationId: message.conversationId, deliveredAt: new Date() }, { upsert: true, new: true });
  return { receipt };
}

export async function blockUser(blockerId: string, blockedUserId: string, reason?: string) {
  if (blockerId === blockedUserId) throw new AppError('You cannot block yourself.', 400);
  const conversation = await ConversationModel.findOne({ directParticipantKey: directKey(blockerId, blockedUserId) }).lean();
  const block = await ConversationBlockModel.findOneAndUpdate({ blockerId, blockedUserId }, { conversationId: conversation?._id, reason }, { upsert: true, new: true });
  await auditChat({ conversationId: conversation?._id?.toString(), actorId: blockerId, action: 'user-blocked', metadata: { blockedUserId } });
  return { block };
}

export async function unblockUser(blockerId: string, blockedUserId: string) {
  await ConversationBlockModel.deleteOne({ blockerId, blockedUserId });
  await auditChat({ actorId: blockerId, action: 'user-unblocked', metadata: { blockedUserId } });
  return { unblocked: true };
}

export async function listBlockedUsers(userId: string) {
  const blocks = await ConversationBlockModel.find({ blockerId: userId }).populate('blockedUserId', 'name avatar role').lean();
  return { blocks };
}

export async function searchConversations(userId: string, query: Record<string, unknown>) {
  return listConversations(userId, { ...query, search: query.q });
}

export async function searchMessages(userId: string, query: Record<string, unknown>) {
  const memberships = await ConversationMemberModel.find({ userId, status: 'active' }).select('conversationId').lean();
  const conversationIds = memberships.map((member) => member.conversationId);
  const filter: FilterQuery<Message> = { conversationId: { $in: conversationIds }, isDeletedForEveryone: false };
  if (query.conversationId) filter.conversationId = query.conversationId;
  if (query.senderId) filter.senderId = query.senderId;
  if (query.type) filter.type = query.type;
  if (query.q) filter.normalizedText = new RegExp(escapeRegex(String(query.q)), 'i');
  if (query.dateFrom || query.dateTo) filter.createdAt = { ...(query.dateFrom ? { $gte: query.dateFrom } : {}), ...(query.dateTo ? { $lte: query.dateTo } : {}) };
  const messages = await MessageModel.find(filter).sort({ createdAt: -1 }).limit(Number(query.limit ?? 20)).lean();
  const sharedFilter: FilterQuery<unknown> = { conversationId: { $in: conversationIds } };
  if (query.conversationId) Object.assign(sharedFilter, { conversationId: query.conversationId });
  if (query.q) {
    const regex = new RegExp(escapeRegex(String(query.q)), 'i');
    Object.assign(sharedFilter, { $or: [{ title: regex }, { content: regex }, { message: regex }] });
  }
  const [notes, announcements] = await Promise.all([
    SharedNoteModel.find(sharedFilter).sort({ updatedAt: -1 }).limit(10).lean(),
    AnnouncementModel.find(sharedFilter).sort({ createdAt: -1 }).limit(10).lean(),
  ]);
  const threadReplies = messages.filter((message) => message.threadRootMessageId);
  return { messages: messages.map(mapMessage), threads: threadReplies.map(mapMessage), notes, announcements };
}
