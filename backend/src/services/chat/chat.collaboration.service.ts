import mongoose, { type FilterQuery } from 'mongoose';
import { CHAT_SOCKET_EVENTS } from '@/constants/chat.constants.js';
import { AnnouncementModel } from '@/models/announcement.model.js';
import { BookmarkModel } from '@/models/bookmark.model.js';
import { ConversationMemberModel } from '@/models/conversation-member.model.js';
import { MessageMentionModel } from '@/models/message-mention.model.js';
import { MessageReactionModel } from '@/models/message-reaction.model.js';
import { MessageModel } from '@/models/message.model.js';
import { PinnedMessageModel } from '@/models/pinned-message.model.js';
import { SharedNoteModel } from '@/models/shared-note.model.js';
import { StarredMessageModel } from '@/models/starred-message.model.js';
import { getActiveMember, requireManageMembers, requireSendPermission } from '@/services/chat/chat.permissions.js';
import { emitChatMessage, emitConversation } from '@/services/chat/chat.socket.js';
import { createMentionsFromText } from '@/services/chat/chat.mention.service.js';
import { createNotification } from '@/services/notification/notification.service.js';
import { AppError } from '@/utils/app-error.js';

async function getAccessibleMessage(messageId: string, userId: string) {
  const message = await MessageModel.findById(messageId);
  if (!message || message.isDeletedForEveryone) throw new AppError('Message not found.', 404);
  await getActiveMember(message.conversationId.toString(), userId);
  return message;
}

async function notifyMembers(input: { conversationId: string; actorId: string; title: string; message: string; type: string; priority?: 'low' | 'medium' | 'high' | 'critical'; metadata?: Record<string, unknown> }) {
  const members = await ConversationMemberModel.find({ conversationId: input.conversationId, status: 'active', userId: { $ne: input.actorId } }).lean();
  await Promise.all(
    members
      .filter((member) => member.notificationLevel !== 'none')
      .map((member) =>
        createNotification({
          receiverId: member.userId.toString(),
          senderId: input.actorId,
          title: input.title,
          message: input.message,
          type: input.type,
          category: 'chat',
          priority: input.priority ?? 'medium',
          actionUrl: `/messages/${input.conversationId}`,
          metadata: { conversationId: input.conversationId, ...input.metadata },
        }),
      ),
  );
}

export async function addReaction(userId: string, input: { messageId: string; emoji: string }) {
  const message = await getAccessibleMessage(input.messageId, userId);
  const reaction = await MessageReactionModel.findOneAndUpdate(
    { messageId: input.messageId, userId },
    { conversationId: message.conversationId, emoji: input.emoji },
    { upsert: true, new: true },
  );
  emitConversation(message.conversationId.toString(), CHAT_SOCKET_EVENTS.REACTION_ADDED, { reaction });
  if (message.senderId.toString() !== userId) {
    await createNotification({
      receiverId: message.senderId.toString(),
      senderId: userId,
      title: 'New message reaction',
      message: `Reacted with ${input.emoji}`,
      type: 'chat-reaction',
      category: 'chat',
      priority: 'low',
      actionUrl: `/messages/${message.conversationId}`,
      metadata: { conversationId: message.conversationId.toString(), messageId: input.messageId },
    });
  }
  return { reaction };
}

export async function removeReaction(userId: string, messageId: string) {
  const message = await getAccessibleMessage(messageId, userId);
  await MessageReactionModel.deleteOne({ messageId, userId });
  emitConversation(message.conversationId.toString(), CHAT_SOCKET_EVENTS.REACTION_REMOVED, { messageId, userId });
  return { removed: true };
}

export async function listMentions(userId: string, query: Record<string, unknown>) {
  const filter: FilterQuery<unknown> = { mentionedUserId: userId };
  if (query.conversationId) {
    await getActiveMember(String(query.conversationId), userId);
    Object.assign(filter, { conversationId: query.conversationId });
  }
  const mentions = await MessageMentionModel.find(filter).sort({ createdAt: -1 }).limit(Number(query.limit ?? 20)).populate('messageId').lean();
  return { mentions };
}

export async function listPinnedMessages(userId: string, query: Record<string, unknown>) {
  if (!query.conversationId) throw new AppError('Conversation id is required.', 400);
  await getActiveMember(String(query.conversationId), userId);
  const pins = await PinnedMessageModel.find({ conversationId: query.conversationId }).sort({ pinnedAt: -1 }).limit(Number(query.limit ?? 20)).populate('messageId').populate('pinnedBy', 'name avatar role').lean();
  return { pins };
}

export async function pinMessage(userId: string, messageId: string) {
  const message = await getAccessibleMessage(messageId, userId);
  const conversationId = message.conversationId.toString();
  const member = await getActiveMember(conversationId, userId);
  if (!member.permissions.canEditConversation && message.senderId.toString() !== userId) throw new AppError('You cannot pin this message.', 403);
  const pinCount = await PinnedMessageModel.countDocuments({ conversationId });
  const exists = await PinnedMessageModel.findOne({ conversationId, messageId }).lean();
  if (!exists && pinCount >= 20) throw new AppError('This conversation already has 20 pinned messages.', 400);
  const pin = await PinnedMessageModel.findOneAndUpdate({ conversationId, messageId }, { pinnedBy: userId, pinnedAt: new Date() }, { upsert: true, new: true });
  emitConversation(conversationId, CHAT_SOCKET_EVENTS.MESSAGE_PINNED, { pin });
  await notifyMembers({ conversationId, actorId: userId, title: 'Message pinned', message: 'A message was pinned in your workspace.', type: 'chat-pin', metadata: { messageId } });
  return { pin };
}

export async function unpinMessage(userId: string, messageId: string) {
  const message = await getAccessibleMessage(messageId, userId);
  const conversationId = message.conversationId.toString();
  const member = await getActiveMember(conversationId, userId);
  if (!member.permissions.canEditConversation && message.senderId.toString() !== userId) throw new AppError('You cannot unpin this message.', 403);
  await PinnedMessageModel.deleteOne({ conversationId, messageId });
  emitConversation(conversationId, CHAT_SOCKET_EVENTS.MESSAGE_UNPINNED, { conversationId, messageId });
  return { removed: true };
}

export async function listStarredMessages(userId: string, query: Record<string, unknown>) {
  const filter: FilterQuery<unknown> = { userId };
  if (query.conversationId) {
    await getActiveMember(String(query.conversationId), userId);
    Object.assign(filter, { conversationId: query.conversationId });
  }
  const stars = await StarredMessageModel.find(filter).sort({ createdAt: -1 }).limit(Number(query.limit ?? 20)).populate('messageId').lean();
  return { stars };
}

export async function starMessage(userId: string, messageId: string) {
  const message = await getAccessibleMessage(messageId, userId);
  const star = await StarredMessageModel.findOneAndUpdate({ messageId, userId }, { conversationId: message.conversationId }, { upsert: true, new: true });
  emitConversation(message.conversationId.toString(), CHAT_SOCKET_EVENTS.MESSAGE_STARRED, { messageId, userId });
  return { star };
}

export async function unstarMessage(userId: string, messageId: string) {
  const message = await getAccessibleMessage(messageId, userId);
  await StarredMessageModel.deleteOne({ messageId, userId });
  emitConversation(message.conversationId.toString(), CHAT_SOCKET_EVENTS.MESSAGE_UNSTARRED, { messageId, userId });
  return { removed: true };
}

export async function getThread(userId: string, query: Record<string, unknown>) {
  const root = await getAccessibleMessage(String(query.messageId), userId);
  const replies = await MessageModel.find({ conversationId: root.conversationId, threadRootMessageId: root._id, deletedForUserIds: { $ne: userId } }).sort({ createdAt: 1 }).limit(Number(query.limit ?? 30)).populate('attachments').populate('locationId').lean();
  return { root, replies };
}

export async function createThreadReply(userId: string, input: { messageId: string; text: string; clientMessageId?: string }) {
  const root = await getAccessibleMessage(input.messageId, userId);
  await requireSendPermission(root.conversationId.toString(), userId);
  const reply = await MessageModel.create({
    conversationId: root.conversationId,
    senderId: userId,
    type: 'text',
    text: input.text,
    normalizedText: input.text.replace(/\s+/g, ' ').trim(),
    threadRootMessageId: root._id,
    clientMessageId: input.clientMessageId,
    status: 'sent',
  });
  await MessageModel.updateOne(
    { _id: root._id },
    {
      $inc: { threadReplyCount: 1 },
      $set: { threadLastReplyAt: reply.createdAt },
      $addToSet: { threadParticipantIds: userId },
    },
  );
  await createMentionsFromText({ conversationId: root.conversationId.toString(), messageId: reply._id.toString(), mentionedBy: userId, text: input.text });
  emitChatMessage(root.conversationId.toString(), reply.toObject());
  emitConversation(root.conversationId.toString(), CHAT_SOCKET_EVENTS.THREAD_UPDATED, { rootMessageId: root._id, reply });
  await notifyMembers({ conversationId: root.conversationId.toString(), actorId: userId, title: 'New thread reply', message: 'A teammate replied in a message thread.', type: 'chat-thread', metadata: { messageId: root._id.toString() } });
  return { reply };
}

export async function listSharedNotes(userId: string, query: Record<string, unknown>) {
  if (!query.conversationId) throw new AppError('Conversation id is required.', 400);
  await getActiveMember(String(query.conversationId), userId);
  const notes = await SharedNoteModel.find({ conversationId: query.conversationId }).sort({ updatedAt: -1 }).limit(Number(query.limit ?? 20)).lean();
  return { notes };
}

export async function createSharedNote(userId: string, input: { conversationId: string; title: string; content: string }) {
  await requireSendPermission(input.conversationId, userId);
  const note = await SharedNoteModel.create({ ...input, createdBy: userId, updatedBy: userId });
  emitConversation(input.conversationId, CHAT_SOCKET_EVENTS.NOTE_UPDATED, { note });
  await notifyMembers({ conversationId: input.conversationId, actorId: userId, title: 'Shared note added', message: input.title, type: 'chat-note', metadata: { noteId: note._id.toString() } });
  return { note };
}

export async function updateSharedNote(userId: string, noteId: string, input: { title?: string; content?: string }) {
  const note = await SharedNoteModel.findById(noteId);
  if (!note) throw new AppError('Note not found.', 404);
  await requireSendPermission(note.conversationId.toString(), userId);
  if (input.title) note.title = input.title;
  if (input.content) note.content = input.content;
  note.updatedBy = new mongoose.Types.ObjectId(userId) as never;
  note.version += 1;
  await note.save();
  emitConversation(note.conversationId.toString(), CHAT_SOCKET_EVENTS.NOTE_UPDATED, { note });
  return { note };
}

export async function deleteSharedNote(userId: string, noteId: string) {
  const note = await SharedNoteModel.findById(noteId);
  if (!note) throw new AppError('Note not found.', 404);
  await requireManageMembers(note.conversationId.toString(), userId);
  await note.deleteOne();
  return { deleted: true };
}

export async function listAnnouncements(userId: string, query: Record<string, unknown>) {
  if (!query.conversationId) throw new AppError('Conversation id is required.', 400);
  await getActiveMember(String(query.conversationId), userId);
  const filter: FilterQuery<unknown> = { conversationId: query.conversationId, $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }] };
  const announcements = await AnnouncementModel.find(filter).sort({ createdAt: -1 }).limit(Number(query.limit ?? 20)).lean();
  return { announcements };
}

export async function createAnnouncement(userId: string, input: { conversationId: string; title: string; message: string; priority: 'normal' | 'important' | 'critical'; expiresAt?: Date }) {
  const member = await getActiveMember(input.conversationId, userId);
  if (!member.permissions.canEditConversation && !member.permissions.canAddMembers) throw new AppError('You cannot create announcements here.', 403);
  const announcement = await AnnouncementModel.create({ ...input, createdBy: userId });
  emitConversation(input.conversationId, CHAT_SOCKET_EVENTS.ANNOUNCEMENT_CREATED, { announcement });
  await notifyMembers({ conversationId: input.conversationId, actorId: userId, title: input.title, message: input.message, type: 'chat-announcement', priority: input.priority === 'critical' ? 'critical' : 'high', metadata: { announcementId: announcement._id.toString() } });
  return { announcement };
}

export async function updateAnnouncement(userId: string, announcementId: string, input: Record<string, unknown>) {
  const announcement = await AnnouncementModel.findById(announcementId);
  if (!announcement) throw new AppError('Announcement not found.', 404);
  await requireManageMembers(announcement.conversationId.toString(), userId);
  announcement.set(input);
  await announcement.save();
  emitConversation(announcement.conversationId.toString(), CHAT_SOCKET_EVENTS.ANNOUNCEMENT_CREATED, { announcement });
  return { announcement };
}

export async function deleteAnnouncement(userId: string, announcementId: string) {
  const announcement = await AnnouncementModel.findById(announcementId);
  if (!announcement) throw new AppError('Announcement not found.', 404);
  await requireManageMembers(announcement.conversationId.toString(), userId);
  await announcement.deleteOne();
  return { deleted: true };
}

export async function listBookmarks(userId: string, query: Record<string, unknown>) {
  const filter: FilterQuery<unknown> = { userId };
  if (query.conversationId) {
    await getActiveMember(String(query.conversationId), userId);
    Object.assign(filter, { conversationId: query.conversationId });
  }
  const bookmarks = await BookmarkModel.find(filter).sort({ createdAt: -1 }).limit(Number(query.limit ?? 20)).populate('messageId').populate('noteId').populate('announcementId').lean();
  return { bookmarks };
}

export async function createBookmark(userId: string, input: { conversationId: string; messageId?: string; noteId?: string; announcementId?: string; label?: string }) {
  await getActiveMember(input.conversationId, userId);
  const bookmark = await BookmarkModel.findOneAndUpdate(
    { userId, ...(input.messageId ? { messageId: input.messageId } : {}), ...(input.noteId ? { noteId: input.noteId } : {}), ...(input.announcementId ? { announcementId: input.announcementId } : {}) },
    input,
    { upsert: true, new: true },
  );
  return { bookmark };
}

export async function deleteBookmark(userId: string, input: { messageId?: string; noteId?: string; announcementId?: string }) {
  await BookmarkModel.deleteOne({ userId, ...input });
  return { deleted: true };
}
