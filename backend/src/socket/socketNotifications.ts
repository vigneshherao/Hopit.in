import type { Socket } from 'socket.io';
import { SOCKET_EVENTS } from '@/socket/socketConstants.js';
import { readNotification } from '@/services/notification/notification.service.js';

export function registerNotificationSocketHandlers(socket: Socket): void {
  socket.on(SOCKET_EVENTS.NOTIFICATION_READ, async (payload: { notificationId?: string }) => {
    if (!payload?.notificationId) return;
    const result = await readNotification(socket.data.userId as string, payload.notificationId);
    socket.emit(SOCKET_EVENTS.NOTIFICATION_UPDATE, result);
  });
}
