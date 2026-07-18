import type { NotificationDocument } from '@/models/notification.model.js';
import { SOCKET_EVENTS } from '@/constants/realtime.constants.js';
import { mapNotification } from '@/services/notification/notification.mapper.js';
import { getSocketServer } from '@/socket/socketServer.js';
import { userRoom } from '@/socket/socketRooms.js';

export function emitNotification(notification: NotificationDocument): void {
  const io = getSocketServer();
  if (!io) return;

  io.to(userRoom(notification.receiverId.toString())).emit(SOCKET_EVENTS.NOTIFICATION_NEW, {
    notification: mapNotification(notification),
  });
}

export function emitNotificationUpdate(userId: string, notification: unknown): void {
  const io = getSocketServer();
  if (!io) return;

  io.to(userRoom(userId)).emit(SOCKET_EVENTS.NOTIFICATION_UPDATE, { notification });
}

export function emitNotificationDelete(userId: string, notificationId: string): void {
  const io = getSocketServer();
  if (!io) return;

  io.to(userRoom(userId)).emit(SOCKET_EVENTS.NOTIFICATION_DELETE, { notificationId });
}
