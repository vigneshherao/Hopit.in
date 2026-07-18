import type { Socket } from 'socket.io';
import { CHAT_SOCKET_EVENTS } from '@/constants/chat.constants.js';
import { messageCreateSchema, messageDeleteSchema, messageEditSchema, readReceiptSchema } from '@/services/chat/chat.validation.js';
import { deleteMessage, editMessage, markConversationRead, markDelivered, sendMessage } from '@/services/chat/chat.service.js';
import { getActiveMember } from '@/services/chat/chat.permissions.js';
import { conversationRoom } from '@/services/chat/chat.socket.js';

const typingTimers = new Map<string, NodeJS.Timeout>();

function emitError(socket: Socket, message: string, code = 'CHAT_ERROR') {
  socket.emit(CHAT_SOCKET_EVENTS.ERROR, { message, code });
}

export function registerChatSocketHandlers(socket: Socket): void {
  socket.on(CHAT_SOCKET_EVENTS.CONVERSATION_JOIN, async (payload: { conversationId?: string }) => {
    try {
      if (!payload?.conversationId) return emitError(socket, 'Conversation id is required.');
      await getActiveMember(payload.conversationId, socket.data.userId as string);
      socket.join(conversationRoom(payload.conversationId));
      socket.emit(CHAT_SOCKET_EVENTS.CONVERSATION_UPDATE, { conversationId: payload.conversationId, joined: true });
    } catch (error) {
      emitError(socket, error instanceof Error ? error.message : 'Unable to join conversation.');
    }
  });

  socket.on(CHAT_SOCKET_EVENTS.CONVERSATION_LEAVE, (payload: { conversationId?: string }) => {
    if (!payload?.conversationId) return;
    socket.leave(conversationRoom(payload.conversationId));
  });

  socket.on(CHAT_SOCKET_EVENTS.MESSAGE_SEND, async (payload: { conversationId?: string; temporaryId?: string; message?: unknown }, ack?: (response: unknown) => void) => {
    try {
      if (!payload?.conversationId) throw new Error('Conversation id is required.');
      const parsed = messageCreateSchema.parse(payload.message ?? payload);
      const result = await sendMessage(payload.conversationId, socket.data.userId as string, parsed);
      ack?.({ success: true, temporaryId: payload.temporaryId ?? parsed.clientMessageId, message: result.message });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send message.';
      emitError(socket, message);
      ack?.({ success: false, temporaryId: payload?.temporaryId, error: message });
    }
  });

  socket.on(CHAT_SOCKET_EVENTS.MESSAGE_EDIT, async (payload: { messageId?: string; text?: string }) => {
    try {
      if (!payload?.messageId) throw new Error('Message id is required.');
      const parsed = messageEditSchema.parse({ text: payload.text });
      await editMessage(payload.messageId, socket.data.userId as string, parsed.text);
    } catch (error) {
      emitError(socket, error instanceof Error ? error.message : 'Unable to edit message.');
    }
  });

  socket.on(CHAT_SOCKET_EVENTS.MESSAGE_DELETE, async (payload: { messageId?: string; scope?: 'self' | 'everyone' }) => {
    try {
      if (!payload?.messageId) throw new Error('Message id is required.');
      const parsed = messageDeleteSchema.parse({ scope: payload.scope });
      await deleteMessage(payload.messageId, socket.data.userId as string, parsed.scope);
    } catch (error) {
      emitError(socket, error instanceof Error ? error.message : 'Unable to delete message.');
    }
  });

  socket.on(CHAT_SOCKET_EVENTS.MESSAGE_DELIVERED, async (payload: { messageId?: string }) => {
    if (!payload?.messageId) return;
    await markDelivered(payload.messageId, socket.data.userId as string);
  });

  socket.on(CHAT_SOCKET_EVENTS.MESSAGE_READ, async (payload: { conversationId?: string; lastReadMessageId?: string }) => {
    try {
      if (!payload?.conversationId) throw new Error('Conversation id is required.');
      const parsed = readReceiptSchema.parse({ lastReadMessageId: payload.lastReadMessageId });
      await markConversationRead(payload.conversationId, socket.data.userId as string, parsed.lastReadMessageId);
    } catch (error) {
      emitError(socket, error instanceof Error ? error.message : 'Unable to update read receipt.');
    }
  });

  socket.on(CHAT_SOCKET_EVENTS.TYPING_START, async (payload: { conversationId?: string }) => {
    try {
      if (!payload?.conversationId) return;
      await getActiveMember(payload.conversationId, socket.data.userId as string);
      const key = `${payload.conversationId}:${socket.data.userId}`;
      socket.to(conversationRoom(payload.conversationId)).emit(CHAT_SOCKET_EVENTS.TYPING_START, { conversationId: payload.conversationId, userId: socket.data.userId });
      if (typingTimers.has(key)) clearTimeout(typingTimers.get(key));
      typingTimers.set(
        key,
        setTimeout(() => {
          socket.to(conversationRoom(payload.conversationId!)).emit(CHAT_SOCKET_EVENTS.TYPING_STOP, { conversationId: payload.conversationId, userId: socket.data.userId });
          typingTimers.delete(key);
        }, 5000),
      );
    } catch {
      emitError(socket, 'Unable to send typing indicator.');
    }
  });

  socket.on(CHAT_SOCKET_EVENTS.TYPING_STOP, (payload: { conversationId?: string }) => {
    if (!payload?.conversationId) return;
    socket.to(conversationRoom(payload.conversationId)).emit(CHAT_SOCKET_EVENTS.TYPING_STOP, { conversationId: payload.conversationId, userId: socket.data.userId });
  });
}
