import mongoose, { type FilterQuery } from 'mongoose';
import { NotificationModel, type Notification } from '@/models/notification.model.js';
import { NotificationPreferenceModel } from '@/models/notification-preference.model.js';
import { emitNotification, emitNotificationDelete, emitNotificationUpdate } from '@/services/notification/notification.socket.js';
import { mapNotification } from '@/services/notification/notification.mapper.js';
import { AppError } from '@/utils/app-error.js';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function dateFilter(date?: string) {
  if (!date) return undefined;
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  if (date === 'today') start.setHours(0, 0, 0, 0);
  if (date === 'yesterday') {
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
  }
  if (date === 'this-week') start.setDate(start.getDate() - 7);
  if (date === 'this-month') start.setMonth(start.getMonth() - 1);
  return { $gte: start, $lte: date === 'yesterday' ? end : now };
}

export async function createNotification(input: Partial<Notification> & { receiverId: string | mongoose.Types.ObjectId; title: string; message: string }) {
  const receiverId = new mongoose.Types.ObjectId(input.receiverId.toString());
  const notification = await NotificationModel.create({
    ...input,
    receiverId,
    userId: receiverId,
    type: input.type ?? 'general',
    priority: input.priority ?? 'medium',
    isRead: false,
  });
  emitNotification(notification);
  return mapNotification(notification);
}

export async function listNotifications(userId: string, query: Record<string, unknown>) {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 20);
  const filter: FilterQuery<Notification> = { receiverId: userId };
  if (query.type) filter.type = query.type;
  if (query.category) filter.category = new RegExp(`^${escapeRegex(String(query.category))}$`, 'i');
  if (query.status === 'read') filter.isRead = true;
  if (query.status === 'unread') filter.isRead = false;
  const createdAt = dateFilter(query.date as string | undefined);
  if (createdAt) filter.createdAt = createdAt;
  if (query.search) {
    const regex = new RegExp(escapeRegex(String(query.search)), 'i');
    filter.$or = [{ title: regex }, { message: regex }, { category: regex }, { type: regex }];
  }

  const [notifications, total, unreadCount] = await Promise.all([
    NotificationModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    NotificationModel.countDocuments(filter),
    NotificationModel.countDocuments({ receiverId: userId, isRead: false }),
  ]);

  return {
    notifications: notifications.map(mapNotification),
    unreadCount,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function listUnreadNotifications(userId: string) {
  const notifications = await NotificationModel.find({ receiverId: userId, isRead: false }).sort({ createdAt: -1 }).limit(50);
  return { notifications: notifications.map(mapNotification), unreadCount: notifications.length };
}

export async function getNotificationPreferences(userId: string) {
  const preferences = await NotificationPreferenceModel.findOneAndUpdate({ userId }, { $setOnInsert: { userId } }, { new: true, upsert: true });
  return { preferences };
}

export async function updateNotificationPreferences(userId: string, payload: Record<string, unknown>) {
  const preferences = await NotificationPreferenceModel.findOneAndUpdate({ userId }, { $set: payload }, { new: true, upsert: true });
  return { preferences };
}

export async function readNotification(userId: string, notificationId: string) {
  const notification = await NotificationModel.findOneAndUpdate({ _id: notificationId, receiverId: userId }, { isRead: true, readAt: new Date() }, { new: true });
  if (!notification) throw new AppError('Notification not found.', 404);
  const mapped = mapNotification(notification);
  emitNotificationUpdate(userId, mapped);
  return { notification: mapped };
}

export async function readAllNotifications(userId: string) {
  await NotificationModel.updateMany({ receiverId: userId, isRead: false }, { isRead: true, readAt: new Date() });
  emitNotificationUpdate(userId, { allRead: true });
  return { updated: true };
}

export async function deleteNotification(userId: string, notificationId: string) {
  const deleted = await NotificationModel.findOneAndDelete({ _id: notificationId, receiverId: userId });
  if (!deleted) throw new AppError('Notification not found.', 404);
  emitNotificationDelete(userId, notificationId);
  return { deleted: true };
}

export async function clearNotifications(userId: string) {
  await NotificationModel.deleteMany({ receiverId: userId });
  emitNotificationUpdate(userId, { cleared: true });
  return { cleared: true };
}
