import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/hooks/useSocket.js';

export function useChatSocket() {
  return useSocket();
}

export function useConversationRoom(conversationId) {
  const { socket, status } = useSocket();

  useEffect(() => {
    if (!socket || !conversationId) return undefined;
    socket.emit('chat:conversation:join', { conversationId });
    return () => socket.emit('chat:conversation:leave', { conversationId });
  }, [conversationId, socket]);

  return { socket, status, isConnected: status === 'online' };
}

export function useChatMessagesSocket(conversationId) {
  const { socket } = useConversationRoom(conversationId);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !conversationId) return undefined;
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    };
    socket.on('chat:message:new', refresh);
    socket.on('chat:message:update', refresh);
    socket.on('chat:message:deleted', refresh);
    socket.on('chat:unread:update', refresh);
    return () => {
      socket.off('chat:message:new', refresh);
      socket.off('chat:message:update', refresh);
      socket.off('chat:message:deleted', refresh);
      socket.off('chat:unread:update', refresh);
    };
  }, [conversationId, queryClient, socket]);

  return { socket };
}

export function useTypingSocket(conversationId) {
  const { socket } = useConversationRoom(conversationId);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (!socket || !conversationId) return undefined;
    const start = (payload) => {
      if (payload.conversationId === conversationId) setTypingUsers((users) => [...new Set([...users, payload.userId])]);
    };
    const stop = (payload) => {
      if (payload.conversationId === conversationId) setTypingUsers((users) => users.filter((id) => id !== payload.userId));
    };
    socket.on('chat:typing:start', start);
    socket.on('chat:typing:stop', stop);
    return () => {
      socket.off('chat:typing:start', start);
      socket.off('chat:typing:stop', stop);
    };
  }, [conversationId, socket]);

  const emitTypingStart = useCallback(() => socket?.emit('chat:typing:start', { conversationId }), [conversationId, socket]);
  const emitTypingStop = useCallback(() => socket?.emit('chat:typing:stop', { conversationId }), [conversationId, socket]);

  return useMemo(() => ({ typingUsers, emitTypingStart, emitTypingStop }), [typingUsers, emitTypingStart, emitTypingStop]);
}

export function useReadReceiptSocket(conversationId) {
  const { socket } = useConversationRoom(conversationId);
  const markRead = (lastReadMessageId) => socket?.emit('chat:message:read', { conversationId, lastReadMessageId });
  return { markRead };
}

export function useConversationSocketEvents(conversationId) {
  useChatMessagesSocket(conversationId);
  return useTypingSocket(conversationId);
}
