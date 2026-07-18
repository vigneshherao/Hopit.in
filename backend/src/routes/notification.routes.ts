import { Router } from 'express';
import { z } from 'zod';
import { clearNotificationsController, deleteNotificationController, notificationPreferencesController, notificationsController, readAllNotificationsController, readNotificationController, unreadNotificationsController, updateNotificationPreferencesController } from '@/controllers/notification.controller.js';
import { authenticate } from '@/middleware/auth.js';
import { validateRequest } from '@/middleware/validate-request.js';
import { notificationPreferenceSchema, notificationQuerySchema } from '@/services/notification/notification.validation.js';
import { asyncHandler } from '@/utils/async-handler.js';

const idParamSchema = z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id.') });

export const notificationRouter = Router();

notificationRouter.use(authenticate);
notificationRouter.get('/', validateRequest({ query: notificationQuerySchema }), asyncHandler(notificationsController));
notificationRouter.get('/unread', asyncHandler(unreadNotificationsController));
notificationRouter.get('/preferences', asyncHandler(notificationPreferencesController));
notificationRouter.patch('/preferences', validateRequest({ body: notificationPreferenceSchema }), asyncHandler(updateNotificationPreferencesController));
notificationRouter.patch('/read-all', asyncHandler(readAllNotificationsController));
notificationRouter.patch('/:id/read', validateRequest({ params: idParamSchema }), asyncHandler(readNotificationController));
notificationRouter.delete('/clear', asyncHandler(clearNotificationsController));
notificationRouter.delete('/:id', validateRequest({ params: idParamSchema }), asyncHandler(deleteNotificationController));
