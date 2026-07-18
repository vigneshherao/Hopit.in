import type { NotificationDocument } from '@/models/notification.model.js';

export function mapNotification(notification: NotificationDocument | Record<string, unknown>) {
  const item = typeof (notification as NotificationDocument).toObject === 'function' ? (notification as NotificationDocument).toObject() : notification;
  const record = item as Record<string, unknown> & { _id?: { toString(): string }; receiverId?: { toString(): string }; senderId?: { toString(): string } };

  return {
    id: record._id?.toString(),
    _id: record._id?.toString(),
    receiverId: record.receiverId?.toString(),
    senderId: record.senderId?.toString(),
    type: record.type,
    category: record.category,
    title: record.title,
    message: record.message,
    priority: record.priority,
    icon: record.icon,
    image: record.image,
    actionUrl: record.actionUrl,
    metadata: record.metadata ?? record.data,
    isRead: record.isRead,
    readAt: record.readAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
