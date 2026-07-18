import type { Socket } from 'socket.io';
import { CHAT_SOCKET_EVENTS } from '@/constants/chat.constants.js';
import { messageCreateSchema, messageDeleteSchema, messageEditSchema, readReceiptSchema } from '@/services/chat/chat.validation.js';
import { announcementCreateSchema, messageTargetSchema, noteCreateSchema, noteUpdateSchema, reactionSchema, threadReplySchema } from '@/services/chat/chat.collaboration.validation.js';
import { addReaction, createAnnouncement, createSharedNote, createThreadReply, pinMessage, removeReaction, starMessage, unpinMessage, unstarMessage, updateSharedNote } from '@/services/chat/chat.collaboration.service.js';
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

  socket.on(CHAT_SOCKET_EVENTS.MESSAGE_REACT, async (payload: unknown, ack?: (response: unknown) => void) => {
    try {
      const parsed = reactionSchema.parse(payload);
      const result = await addReaction(socket.data.userId as string, parsed);
      ack?.({ success: true, reaction: result.reaction });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to react to message.';
      emitError(socket, message);
      ack?.({ success: false, error: message });
    }
  });

  socket.on(CHAT_SOCKET_EVENTS.MESSAGE_UNREACT, async (payload: unknown, ack?: (response: unknown) => void) => {
    try {
      const parsed = messageTargetSchema.parse(payload);
      const result = await removeReaction(socket.data.userId as string, parsed.messageId);
      ack?.({ success: true, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to remove reaction.';
      emitError(socket, message);
      ack?.({ success: false, error: message });
    }
  });

  socket.on(CHAT_SOCKET_EVENTS.MESSAGE_PIN, async (payload: unknown, ack?: (response: unknown) => void) => {
    try {
      const parsed = messageTargetSchema.parse(payload);
      const result = await pinMessage(socket.data.userId as string, parsed.messageId);
      ack?.({ success: true, pin: result.pin });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to pin message.';
      emitError(socket, message);
      ack?.({ success: false, error: message });
    }
  });

  socket.on(CHAT_SOCKET_EVENTS.MESSAGE_UNPIN, async (payload: unknown, ack?: (response: unknown) => void) => {
    try {
      const parsed = messageTargetSchema.parse(payload);
      const result = await unpinMessage(socket.data.userId as string, parsed.messageId);
      ack?.({ success: true, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to unpin message.';
      emitError(socket, message);
      ack?.({ success: false, error: message });
    }
  });

  socket.on(CHAT_SOCKET_EVENTS.MESSAGE_STAR, async (payload: unknown, ack?: (response: unknown) => void) => {
    try {
      const parsed = messageTargetSchema.parse(payload);
      const result = await starMessage(socket.data.userId as string, parsed.messageId);
      ack?.({ success: true, star: result.star });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to star message.';
      emitError(socket, message);
      ack?.({ success: false, error: message });
    }
  });

  socket.on(CHAT_SOCKET_EVENTS.MESSAGE_UNSTAR, async (payload: unknown, ack?: (response: unknown) => void) => {
    try {
      const parsed = messageTargetSchema.parse(payload);
      const result = await unstarMessage(socket.data.userId as string, parsed.messageId);
      ack?.({ success: true, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to unstar message.';
      emitError(socket, message);
      ack?.({ success: false, error: message });
    }
  });

  socket.on(CHAT_SOCKET_EVENTS.THREAD_REPLY, async (payload: unknown, ack?: (response: unknown) => void) => {
    try {
      const parsed = threadReplySchema.parse(payload);
      const result = await createThreadReply(socket.data.userId as string, parsed);
      ack?.({ success: true, reply: result.reply });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to reply in thread.';
      emitError(socket, message);
      ack?.({ success: false, error: message });
    }
  });

  socket.on(CHAT_SOCKET_EVENTS.NOTE_UPDATE, async (payload: { noteId?: string; conversationId?: string; title?: string; content?: string }, ack?: (response: unknown) => void) => {
    try {
      const result = payload.noteId ? await updateSharedNote(socket.data.userId as string, payload.noteId, noteUpdateSchema.parse(payload)) : await createSharedNote(socket.data.userId as string, noteCreateSchema.parse(payload));
      ack?.({ success: true, note: result.note });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update note.';
      emitError(socket, message);
      ack?.({ success: false, error: message });
    }
  });

  socket.on(CHAT_SOCKET_EVENTS.ANNOUNCEMENT_CREATE, async (payload: unknown, ack?: (response: unknown) => void) => {
    try {
      const parsed = announcementCreateSchema.parse(payload);
      const result = await createAnnouncement(socket.data.userId as string, parsed);
      ack?.({ success: true, announcement: result.announcement });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create announcement.';
      emitError(socket, message);
      ack?.({ success: false, error: message });
    }
  });
}
