import { z } from 'zod';
import { NOTIFICATION_PRIORITIES, NOTIFICATION_TYPES } from '@/constants/realtime.constants.js';

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().max(120).optional(),
  type: z.enum(NOTIFICATION_TYPES).optional(),
  category: z.string().trim().max(80).optional(),
  status: z.enum(['read', 'unread']).optional(),
  date: z.enum(['today', 'yesterday', 'this-week', 'this-month']).optional(),
});

export const notificationPreferenceSchema = z.object({
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  sms: z.boolean().optional(),
  inApp: z.boolean().optional(),
  agreementNotifications: z.boolean().optional(),
  taskNotifications: z.boolean().optional(),
  weatherAlerts: z.boolean().optional(),
  diseaseAlerts: z.boolean().optional(),
  expenseAlerts: z.boolean().optional(),
  incomeAlerts: z.boolean().optional(),
  adminMessages: z.boolean().optional(),
  marketing: z.boolean().optional(),
});

export const notificationCreateSchema = z.object({
  receiverId: z.string().trim().min(1),
  senderId: z.string().trim().min(1).optional(),
  title: z.string().trim().min(2).max(180),
  message: z.string().trim().min(2).max(700),
  type: z.string().trim().min(2).max(80).default('general'),
  category: z.string().trim().max(80).optional(),
  priority: z.enum(NOTIFICATION_PRIORITIES).default('medium'),
  icon: z.string().trim().max(80).optional(),
  image: z.string().trim().url().optional(),
  actionUrl: z.string().trim().max(240).optional(),
  metadata: z.record(z.unknown()).optional(),
});
