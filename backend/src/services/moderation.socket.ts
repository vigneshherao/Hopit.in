import type { MODERATION_SOCKET_EVENTS } from '@/constants/moderation.constants.js';
import { adminRoom, userRoom } from '@/socket/socketRooms.js';
import { getSocketServer } from '@/socket/socketServer.js';

export function emitModerationEvent(event: (typeof MODERATION_SOCKET_EVENTS)[keyof typeof MODERATION_SOCKET_EVENTS], payload: Record<string, unknown>, userId?: string) {
  const io = getSocketServer();
  if (!io) return;
  io.to(adminRoom()).emit(event, payload);
  if (userId) io.to(userRoom(userId)).emit(event, payload);
}
