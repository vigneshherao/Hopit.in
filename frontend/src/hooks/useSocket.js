import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext.jsx';
import { env } from '@/services/env.js';
import { getAccessToken } from '@/services/tokenStore.js';

const apiOrigin = env.apiBaseUrl.replace(/\/api\/v1\/?$/, '');

export function useSocket() {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('offline');

  useEffect(() => {
    if (!isAuthenticated) {
      setSocket(null);
      setStatus('offline');
      return undefined;
    }

    const client = io(apiOrigin, {
      auth: { token: getAccessToken(), device: 'web' },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    client.on('connect', () => setStatus('online'));
    client.on('disconnect', () => setStatus('offline'));
    client.on('connect_error', () => setStatus('offline'));

    const heartbeat = window.setInterval(() => {
      if (client.connected) client.emit('heartbeat');
    }, 30_000);

    setSocket(client);

    return () => {
      window.clearInterval(heartbeat);
      client.disconnect();
    };
  }, [isAuthenticated]);

  return useMemo(() => ({ socket, status, isConnected: status === 'online' }), [socket, status]);
}

export function useNotificationsSocket() {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return undefined;
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['notifications'] });
    socket.on('notification:new', refresh);
    socket.on('notification:update', refresh);
    socket.on('notification:delete', refresh);
    return () => {
      socket.off('notification:new', refresh);
      socket.off('notification:update', refresh);
      socket.off('notification:delete', refresh);
    };
  }, [queryClient, socket]);
}

export function usePresenceSocket() {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return undefined;
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['presence'] });
    socket.on('presence:update', refresh);
    socket.on('user:online', refresh);
    socket.on('user:offline', refresh);
    return () => {
      socket.off('presence:update', refresh);
      socket.off('user:online', refresh);
      socket.off('user:offline', refresh);
    };
  }, [queryClient, socket]);
}

export function useActivitySocket() {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return undefined;
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['activity'] });
    socket.on('activity:new', refresh);
    return () => socket.off('activity:new', refresh);
  }, [queryClient, socket]);
}
