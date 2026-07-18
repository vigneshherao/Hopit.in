import { z } from 'zod';
import { REPORT_ENTITY_TYPES, REPORT_REASONS } from '@/models/reported-item.model.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id.');

export const enterpriseConversationQuerySchema = z.object({
  conversationId: objectId.optional(),
  farmPlanId: objectId.optional(),
  agreementId: objectId.optional(),
  taskId: objectId.optional(),
  status: z.string().trim().max(80).optional(),
  entityType: z.string().trim().max(80).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const reportCreateSchema = z.object({
  entityType: z.enum(REPORT_ENTITY_TYPES),
  entityId: objectId,
  conversationId: objectId.optional(),
  reason: z.enum(REPORT_REASONS),
  description: z.string().trim().max(1000).optional(),
});

export const reportParamSchema = z.object({ reportId: objectId });

export const moderationActionSchema = z.object({
  action: z.enum(['approve', 'dismiss', 'mute-user', 'suspend-user', 'delete-message', 'delete-attachment', 'resolve-report']),
  resolution: z.string().trim().max(1000).optional(),
});

export const auditQuerySchema = z.object({
  userId: objectId.optional(),
  action: z.string().trim().max(120).optional(),
  entity: z.string().trim().max(120).optional(),
  entityId: objectId.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const digestSettingsSchema = z.object({
  frequency: z.enum(['instant', 'hourly', 'daily', 'weekly']),
  channels: z.array(z.enum(['in-app', 'email', 'push'])).min(1).max(3),
});
