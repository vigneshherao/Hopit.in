import type { Response } from 'express';
import type { AuthenticatedRequest } from '@/types/http.js';
import { addMembers, blockUser, createDirectConversation, createGroupConversation, deleteChatAttachment, deleteMessage, editMessage, forwardMessage, getChatAttachment, getConversation, getMessage, listBlockedUsers, listChatUsers, listConversations, listMembers, listMessages, markConversationRead, markDelivered, removeMember, searchConversations, searchMessages, sendMessage, setConversationFlag, unblockUser, updateConversation, updateMember, uploadChatAttachments } from '@/services/chat/chat.service.js';
import { sendSuccess } from '@/utils/api-response.js';

function mutedUntil(duration?: string) {
  const now = new Date();
  if (duration === '1-hour') return new Date(now.getTime() + 60 * 60_000);
  if (duration === '8-hours') return new Date(now.getTime() + 8 * 60 * 60_000);
  if (duration === '1-day') return new Date(now.getTime() + 24 * 60 * 60_000);
  if (duration === '1-week') return new Date(now.getTime() + 7 * 24 * 60 * 60_000);
  return undefined;
}

export async function conversationsController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Conversations retrieved.', await listConversations(req.user!.id, req.query));
}

export async function conversationController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Conversation retrieved.', await getConversation(req.params.conversationId as string, req.user!.id));
}

export async function createDirectConversationController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 201, 'Direct conversation ready.', await createDirectConversation(req.user!.id, req.body.participantId));
}

export async function chatUsersController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Chat users retrieved.', await listChatUsers(req.user!.id, req.query));
}

export async function createGroupConversationController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 201, 'Group conversation created.', await createGroupConversation(req.user!.id, req.body));
}

export async function updateConversationController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Conversation updated.', await updateConversation(req.params.conversationId as string, req.user!.id, req.body));
}

export async function archiveConversationController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Conversation archived.', await setConversationFlag(req.params.conversationId as string, req.user!.id, 'isArchived', true));
}

export async function unarchiveConversationController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Conversation unarchived.', await setConversationFlag(req.params.conversationId as string, req.user!.id, 'isArchived', false));
}

export async function pinConversationController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Conversation pinned.', await setConversationFlag(req.params.conversationId as string, req.user!.id, 'isPinned', true));
}

export async function unpinConversationController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Conversation unpinned.', await setConversationFlag(req.params.conversationId as string, req.user!.id, 'isPinned', false));
}

export async function muteConversationController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Conversation muted.', await setConversationFlag(req.params.conversationId as string, req.user!.id, 'isMuted', true, mutedUntil(req.body.duration)));
}

export async function unmuteConversationController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Conversation unmuted.', await setConversationFlag(req.params.conversationId as string, req.user!.id, 'isMuted', false));
}

export async function leaveConversationController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Conversation hidden.', await setConversationFlag(req.params.conversationId as string, req.user!.id, 'isArchived', true));
}

export async function membersController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Conversation members retrieved.', await listMembers(req.params.conversationId as string, req.user!.id));
}

export async function addMembersController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 201, 'Conversation members added.', await addMembers(req.params.conversationId as string, req.user!.id, req.body.userIds, req.body.role));
}

export async function updateMemberController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Conversation member updated.', await updateMember(req.params.conversationId as string, req.user!.id, req.params.userId as string, req.body));
}

export async function removeMemberController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Conversation member removed.', await removeMember(req.params.conversationId as string, req.user!.id, req.params.userId as string));
}

export async function messagesController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Messages retrieved.', await listMessages(req.params.conversationId as string, req.user!.id, req.query));
}

export async function messageController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Message retrieved.', await getMessage(req.params.messageId as string, req.user!.id));
}

export async function sendMessageController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 201, 'Message sent.', await sendMessage(req.params.conversationId as string, req.user!.id, req.body));
}

export async function editMessageController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Message edited.', await editMessage(req.params.messageId as string, req.user!.id, req.body.text));
}

export async function deleteMessageController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Message deleted.', await deleteMessage(req.params.messageId as string, req.user!.id, req.body.scope));
}

export async function forwardMessageController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 201, 'Message forwarded.', await forwardMessage(req.params.messageId as string, req.user!.id, req.body.conversationIds));
}

export async function markReadController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Conversation marked read.', await markConversationRead(req.params.conversationId as string, req.user!.id, req.body.lastReadMessageId));
}

export async function markDeliveredController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Message delivered.', await markDelivered(req.params.messageId as string, req.user!.id));
}

export async function uploadAttachmentsController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 201, 'Attachments uploaded.', await uploadChatAttachments(req.params.conversationId as string, req.user!.id, Array.isArray(req.files) ? req.files : []));
}

export async function attachmentController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Attachment retrieved.', await getChatAttachment(req.params.attachmentId as string, req.user!.id));
}

export async function deleteAttachmentController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Attachment deleted.', await deleteChatAttachment(req.params.attachmentId as string, req.user!.id));
}

export async function blockUserController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 201, 'User blocked.', await blockUser(req.user!.id, req.params.userId as string, req.body.reason));
}

export async function unblockUserController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'User unblocked.', await unblockUser(req.user!.id, req.params.userId as string));
}

export async function blockedUsersController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Blocked users retrieved.', await listBlockedUsers(req.user!.id));
}

export async function searchConversationsController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Conversation search complete.', await searchConversations(req.user!.id, req.query));
}

export async function searchMessagesController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Message search complete.', await searchMessages(req.user!.id, req.query));
}
