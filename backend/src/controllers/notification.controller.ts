import type { Response } from 'express';
import type { AuthenticatedRequest } from '@/types/http.js';
import { clearNotifications, deleteNotification, getNotificationPreferences, listNotifications, listUnreadNotifications, readAllNotifications, readNotification, updateNotificationPreferences } from '@/services/notification/notification.service.js';
import { sendSuccess } from '@/utils/api-response.js';

export async function notificationsController(req: AuthenticatedRequest, res: Response) {
  const data = await listNotifications(req.user!.id, req.query);
  sendSuccess(res, 200, 'Notifications retrieved.', data);
}

export async function unreadNotificationsController(req: AuthenticatedRequest, res: Response) {
  const data = await listUnreadNotifications(req.user!.id);
  sendSuccess(res, 200, 'Unread notifications retrieved.', data);
}

export async function notificationPreferencesController(req: AuthenticatedRequest, res: Response) {
  const data = await getNotificationPreferences(req.user!.id);
  sendSuccess(res, 200, 'Notification preferences retrieved.', data);
}

export async function updateNotificationPreferencesController(req: AuthenticatedRequest, res: Response) {
  const data = await updateNotificationPreferences(req.user!.id, req.body);
  sendSuccess(res, 200, 'Notification preferences updated.', data);
}

export async function readNotificationController(req: AuthenticatedRequest, res: Response) {
  const data = await readNotification(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, 'Notification marked as read.', data);
}

export async function readAllNotificationsController(req: AuthenticatedRequest, res: Response) {
  const data = await readAllNotifications(req.user!.id);
  sendSuccess(res, 200, 'All notifications marked as read.', data);
}

export async function deleteNotificationController(req: AuthenticatedRequest, res: Response) {
  const data = await deleteNotification(req.user!.id, req.params.id as string);
  sendSuccess(res, 200, 'Notification deleted.', data);
}

export async function clearNotificationsController(req: AuthenticatedRequest, res: Response) {
  const data = await clearNotifications(req.user!.id);
  sendSuccess(res, 200, 'Notifications cleared.', data);
}
