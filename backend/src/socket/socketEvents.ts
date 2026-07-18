import type { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '@/socket/socketConstants.js';
import { registerActivitySocketHandlers } from '@/socket/socketActivity.js';
import { registerNotificationSocketHandlers } from '@/socket/socketNotifications.js';
import { registerPresence, unregisterPresence, updatePresenceFromSocket } from '@/socket/socketPresence.js';
import { safeJoinRoom } from '@/socket/socketMiddleware.js';
import { registerChatSocketHandlers } from '@/socket/socketChat.js';

export function registerSocketEvents(io: Server): void {
  io.on('connection', (socket: Socket) => {
    void registerPresence(socket);
    registerNotificationSocketHandlers(socket);
    registerActivitySocketHandlers(socket);
    registerChatSocketHandlers(socket);

    socket.on(SOCKET_EVENTS.JOIN_ROOM, async (payload: { room?: string }) => {
      if (!payload?.room) return;
      const joined = await safeJoinRoom(socket, payload.room);
      socket.emit('room:joined', { room: payload.room, joined });
    });

    socket.on(SOCKET_EVENTS.LEAVE_ROOM, (payload: { room?: string }) => {
      if (!payload?.room) return;
      socket.leave(payload.room);
      socket.emit('room:left', { room: payload.room });
    });

    socket.on(SOCKET_EVENTS.PRESENCE_UPDATE, (payload: { status?: 'online' | 'away' | 'busy' | 'invisible' }) => {
      void updatePresenceFromSocket(socket, payload?.status ?? 'online');
    });

    socket.on(SOCKET_EVENTS.HEARTBEAT, () => {
      void updatePresenceFromSocket(socket, 'online');
      socket.emit('heartbeat:ack', { at: new Date().toISOString() });
    });

    socket.on('disconnect', () => {
      void unregisterPresence(socket);
    });
  });
}
