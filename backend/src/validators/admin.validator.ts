import { z } from 'zod';
import { ADMIN_PERMISSION_CATALOG, ADMIN_PROFILE_STATUSES, ADMIN_ROLE_SLUGS, SAVED_VIEW_RESOURCES, VERIFICATION_STATUSES, VERIFICATION_TYPES } from '@/constants/admin.constants.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id.');

export const adminIdParamSchema = z.object({ adminId: objectId });
export const userIdParamSchema = z.object({ userId: objectId });
export const roleIdParamSchema = z.object({ roleId: objectId });
export const verificationIdParamSchema = z.object({ verificationId: objectId });
export const sessionIdParamSchema = z.object({ sessionId: objectId });
export const auditLogIdParamSchema = z.object({ auditLogId: objectId });
export const savedViewIdParamSchema = z.object({ viewId: objectId });
export const noteIdParamSchema = z.object({ noteId: objectId });

export const cursorQuerySchema = z.object({
  cursor: objectId.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export const adminMeUpdateSchema = z.object({
  displayName: z.string().trim().min(2).max(120).optional(),
  jobTitle: z.string().trim().max(120).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const adminUserQuerySchema = cursorQuerySchema.extend({
  q: z.string().trim().max(120).optional(),
  status: z.string().trim().max(80).optional(),
  role: z.enum(['owner', 'farmer', 'worker', 'admin']).optional(),
  verificationStatus: z.enum(VERIFICATION_STATUSES).optional(),
  verificationType: z.enum(VERIFICATION_TYPES).optional(),
  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),
  lastLoginFrom: z.coerce.date().optional(),
  lastLoginTo: z.coerce.date().optional(),
  hasActiveSession: z.coerce.boolean().optional(),
  country: z.string().trim().max(80).optional(),
  state: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  sort: z.enum(['newest', 'oldest', 'last-login', 'name']).default('newest'),
});

export const adminUserUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  role: z.enum(['owner', 'farmer', 'worker', 'admin']).optional(),
  isEmailVerified: z.boolean().optional(),
  isPhoneVerified: z.boolean().optional(),
  location: z.record(z.unknown()).optional(),
});

export const reasonSchema = z.object({ reason: z.string().trim().min(5).max(1000) });
export const suspendUserSchema = reasonSchema.extend({ duration: z.enum(['24-hours', '7-days', '30-days', 'permanent']).default('24-hours') });
export const restrictUserSchema = reasonSchema.extend({ restrictions: z.array(z.string().trim().min(2).max(80)).min(1).max(20), expiresAt: z.coerce.date().nullable().optional() });
export const restoreUserSchema = reasonSchema;

export const loginHistoryQuerySchema = cursorQuerySchema.extend({
  success: z.coerce.boolean().optional(),
  suspicious: z.coerce.boolean().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  device: z.string().trim().max(120).optional(),
  ip: z.string().trim().max(80).optional(),
});

export const verificationQuerySchema = cursorQuerySchema.extend({
  status: z.enum(VERIFICATION_STATUSES).optional(),
  type: z.enum(VERIFICATION_TYPES).optional(),
  assignedReviewer: objectId.optional(),
  q: z.string().trim().max(120).optional(),
});

export const verificationAssignSchema = z.object({ reviewerId: objectId });
export const verificationApproveSchema = z.object({ reviewNotes: z.string().trim().max(2000).optional(), expiresAt: z.coerce.date().nullable().optional(), version: z.number().int().optional() });
export const verificationRejectSchema = z.object({ reason: z.string().trim().min(5).max(1000), reviewNotes: z.string().trim().max(2000).optional(), version: z.number().int().optional() });
export const verificationResubmitSchema = z.object({ reason: z.string().trim().min(5).max(1000), version: z.number().int().optional() });

export const adminCreateSchema = z.object({
  userId: objectId,
  roleIds: z.array(objectId).min(1).max(10),
  department: z.string().trim().max(120).optional(),
  jobTitle: z.string().trim().max(120).optional(),
});

export const adminUpdateSchema = z.object({
  displayName: z.string().trim().min(2).max(120).optional(),
  roleIds: z.array(objectId).min(1).max(10).optional(),
  status: z.enum(ADMIN_PROFILE_STATUSES).optional(),
  department: z.string().trim().max(120).optional(),
  jobTitle: z.string().trim().max(120).optional(),
});

export const adminRolesUpdateSchema = z.object({ roleIds: z.array(objectId).min(1).max(10) });
export const permissionOverrideSchema = z.object({
  allow: z.array(z.enum(ADMIN_PERMISSION_CATALOG as [string, ...string[]])).default([]),
  deny: z.array(z.enum(ADMIN_PERMISSION_CATALOG as [string, ...string[]])).default([]),
  reason: z.string().trim().min(5).max(500),
});

export const roleCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.enum(ADMIN_ROLE_SLUGS).or(z.string().trim().regex(/^[a-z0-9-]{3,80}$/)),
  description: z.string().trim().max(700).optional(),
  permissions: z.array(z.enum(ADMIN_PERMISSION_CATALOG as [string, ...string[]])).default([]),
  isActive: z.boolean().default(true),
});

export const roleUpdateSchema = roleCreateSchema.partial();

export const auditQuerySchema = cursorQuerySchema.extend({
  adminId: objectId.optional(),
  action: z.string().trim().max(120).optional(),
  targetType: z.string().trim().max(120).optional(),
  targetId: objectId.optional(),
  result: z.enum(['success', 'denied', 'failed']).optional(),
  permissionUsed: z.string().trim().max(120).optional(),
  requestId: z.string().trim().max(120).optional(),
});

export const savedViewSchema = z.object({
  name: z.string().trim().min(2).max(120),
  resourceType: z.enum(SAVED_VIEW_RESOURCES),
  filters: z.record(z.unknown()).default({}),
  sort: z.string().trim().max(120).optional(),
  columns: z.array(z.string().trim().max(80)).max(40).default([]),
  isDefault: z.boolean().default(false),
});

export const impersonationStartSchema = z.object({
  reason: z.string().trim().min(10).max(1000),
  ticketReference: z.string().trim().max(120).optional(),
});

export const internalNoteSchema = z.object({
  content: z.string().trim().min(2).max(3000),
  visibility: z.enum(['support', 'admin', 'security']).default('support'),
});
