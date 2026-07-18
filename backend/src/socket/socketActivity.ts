import type { Socket } from 'socket.io';
import { SOCKET_EVENTS } from '@/socket/socketConstants.js';

export function registerActivitySocketHandlers(socket: Socket): void {
  socket.on(SOCKET_EVENTS.ACTIVITY_READ, (payload: { activityId?: string }) => {
    socket.emit(SOCKET_EVENTS.ACTIVITY_NEW, { acknowledged: true, activityId: payload?.activityId });
  });
}
