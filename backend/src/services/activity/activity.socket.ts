import { SOCKET_EVENTS } from '@/constants/realtime.constants.js';
import { getSocketServer } from '@/socket/socketServer.js';
import { userRoom } from '@/socket/socketRooms.js';

export function emitActivity(userId: string, activity: unknown): void {
  const io = getSocketServer();
  if (!io) return;

  io.to(userRoom(userId)).emit(SOCKET_EVENTS.ACTIVITY_NEW, { activity });
}
