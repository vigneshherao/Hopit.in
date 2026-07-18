import { CHAT_SOCKET_EVENTS } from '@/constants/chat.constants.js';
import { getSocketServer } from '@/socket/socketServer.js';

export function conversationRoom(conversationId: string): string {
  return `conversation:${conversationId}`;
}

export function emitConversation(conversationId: string, event: string, payload: unknown): void {
  const io = getSocketServer();
  if (!io) return;
  io.to(conversationRoom(conversationId)).emit(event, payload);
}

export function emitChatMessage(conversationId: string, message: unknown): void {
  emitConversation(conversationId, CHAT_SOCKET_EVENTS.MESSAGE_NEW, { message });
}

export function emitChatUpdate(conversationId: string, message: unknown): void {
  emitConversation(conversationId, CHAT_SOCKET_EVENTS.MESSAGE_UPDATE, { message });
}

export function emitChatUnread(conversationId: string, payload: unknown): void {
  emitConversation(conversationId, CHAT_SOCKET_EVENTS.UNREAD_UPDATE, payload);
}
