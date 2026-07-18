import { SOCKET_EVENTS } from '@/constants/realtime.constants.js';
import { getSocketServer } from '@/socket/socketServer.js';
import { userRoom } from '@/socket/socketRooms.js';

export function emitPresenceUpdate(userId: string, presence: unknown): void {
  const io = getSocketServer();
  if (!io) return;

  io.emit(SOCKET_EVENTS.PRESENCE_UPDATED, { userId, presence });
  io.to(userRoom(userId)).emit(SOCKET_EVENTS.PRESENCE_UPDATED, { userId, presence });
}
