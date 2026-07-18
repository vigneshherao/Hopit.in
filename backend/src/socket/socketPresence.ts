import type { Socket } from 'socket.io';
import { SOCKET_EVENTS } from '@/socket/socketConstants.js';
import { closeSession, createSession, setPresence } from '@/services/presence/presence.service.js';
import { userRoom } from '@/socket/socketRooms.js';

export async function registerPresence(socket: Socket): Promise<void> {
  const userId = socket.data.userId as string;
  const device = socket.data.device as string | undefined;
  socket.join(userRoom(userId));
  await createSession({ userId, socketId: socket.id, ip: socket.handshake.address, device });
  await setPresence(userId, 'online', device);
  socket.broadcast.emit(SOCKET_EVENTS.USER_ONLINE, { userId });
}

export async function updatePresenceFromSocket(socket: Socket, status: 'online' | 'offline' | 'away' | 'busy' | 'invisible' = 'online'): Promise<void> {
  socket.data.lastSeen = new Date();
  await setPresence(socket.data.userId as string, status, socket.data.device as string | undefined);
}

export async function unregisterPresence(socket: Socket): Promise<void> {
  const userId = socket.data.userId as string | undefined;
  if (!userId) return;
  await closeSession(socket.id);
  await setPresence(userId, 'offline', socket.data.device as string | undefined);
  socket.broadcast.emit(SOCKET_EVENTS.USER_OFFLINE, { userId });
}
