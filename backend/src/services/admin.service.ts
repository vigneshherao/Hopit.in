import type { Request } from 'express';
import mongoose, { type FilterQuery, type SortOrder } from 'mongoose';
import { ADMIN_PERMISSIONS } from '@/constants/admin.constants.js';
import { AdminActionLogModel } from '@/models/admin-action-log.model.js';
import { AdminInternalNoteModel } from '@/models/admin-internal-note.model.js';
import { AdminNotificationPreferenceModel } from '@/models/admin-notification-preference.model.js';
import { AdminPermissionOverrideModel } from '@/models/admin-permission-override.model.js';
import { AdminProfileModel } from '@/models/admin-profile.model.js';
import { AdminRoleModel } from '@/models/admin-role.model.js';
import { AdminSavedViewModel } from '@/models/admin-saved-view.model.js';
import { AgreementModel } from '@/models/agreement.model.js';
import { ApplicationModel } from '@/models/application.model.js';
import { FarmPlanModel } from '@/models/farm-plan.model.js';
import { ImpersonationSessionModel } from '@/models/impersonation-session.model.js';
import { LandModel } from '@/models/land.model.js';
import { LoginHistoryModel } from '@/models/login-history.model.js';
import { NotificationModel } from '@/models/notification.model.js';
import { RefreshTokenModel } from '@/models/refresh-token.model.js';
import { UserSessionModel } from '@/models/user-session.model.js';
import { UserStatusHistoryModel } from '@/models/user-status-history.model.js';
import { UserVerificationModel } from '@/models/user-verification.model.js';
import { UserModel } from '@/models/user.model.js';
import { WorkerProfileModel } from '@/models/worker-profile.model.js';
import { createNotification } from '@/services/notification/notification.service.js';
import type { AuthenticatedRequest, AuthenticatedUser } from '@/types/http.js';
import { AppError } from '@/utils/app-error.js';
import { hasAdminPermission, resolveAdminPermissions, ensureSystemAdminRoles } from '@/utils/adminPermission.util.js';
import { env } from '@/config/env.js';

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function durationToExpiry(duration: string) {
  if (duration === 'permanent') return undefined;
  const days = duration === '24-hours' ? 1 : duration === '7-days' ? 7 : 30;
  return new Date(Date.now() + days * 24 * 60 * 60_000);
}

function requestMeta(req?: Request) {
  return {
    ip: req?.ip,
    userAgent: req?.get('user-agent'),
    requestId: req?.get('x-request-id') ?? new mongoose.Types.ObjectId().toString(),
  };
}

function safeUser(user: Record<string, unknown>, canViewPrivate = false) {
  const mapped = {
    id: String(user._id),
    _id: String(user._id),
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    location: user.location,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } as Record<string, unknown>;
  if (canViewPrivate) {
    mapped.email = user.email;
    mapped.phone = user.phone;
  }
  return mapped;
}

function asRecord(value: unknown) {
  return value as Record<string, unknown>;
}

export async function writeAdminAction(req: AuthenticatedRequest | undefined, input: { action: string; targetType: string; targetId?: string; permissionUsed?: string; result?: 'success' | 'denied' | 'failed'; reason?: string; oldValue?: Record<string, unknown>; newValue?: Record<string, unknown>; metadata?: Record<string, unknown> }) {
  const meta = requestMeta(req);
  return AdminActionLogModel.create({
    adminId: req?.user?.id,
    adminProfileId: req?.admin?.profile?._id,
    permissionUsed: input.permissionUsed ?? req?.adminPermission,
    result: input.result ?? 'success',
    ...input,
    ...meta,
  });
}

export async function getAdminMe(userId: string) {
  await ensureSystemAdminRoles();
  const effective = await resolveAdminPermissions(userId);
  const preferences = await AdminNotificationPreferenceModel.findOneAndUpdate(
    { adminId: userId },
    { $setOnInsert: { adminId: userId, digestFrequency: 'instant', channels: ['in-app'], categories: {} } },
    { upsert: true, new: true },
  ).lean();
  return { profile: effective.profile.toObject(), roles: effective.roles, permissions: effective.permissions, deniedPermissions: effective.deniedPermissions, preferences, security: { require2fa: env.adminRequire2fa, impersonationEnabled: env.adminImpersonationEnabled } };
}

export async function updateAdminMe(req: AuthenticatedRequest, input: Record<string, unknown>) {
  const profile = req.admin!.profile;
  const oldValue = profile.toObject();
  Object.assign(profile, input, { updatedBy: req.user!.id });
  await profile.save();
  await writeAdminAction(req, { action: 'admin-self-updated', targetType: 'admin-profile', targetId: profile._id.toString(), oldValue: asRecord(oldValue), newValue: asRecord(profile.toObject()) });
  return { profile };
}

export async function getDashboardOverview() {
  const sinceDay = new Date(Date.now() - 24 * 60 * 60_000);
  const sinceWeek = new Date(Date.now() - 7 * 24 * 60 * 60_000);
  const sinceMonth = new Date(Date.now() - 30 * 24 * 60 * 60_000);
  const [totalUsers, activeUsers, suspendedUsers, newToday, newThisWeek, newThisMonth, totalFarms, totalLands, publishedLands, pendingLands, totalAgreements, activeAgreements, totalWorkers, verifiedWorkers, pendingVerifications, sessions] = await Promise.all([
    UserModel.countDocuments(),
    UserModel.countDocuments({ isActive: true }),
    UserStatusHistoryModel.distinct('userId', { newStatus: 'suspended' }).then((ids) => ids.length),
    UserModel.countDocuments({ createdAt: { $gte: sinceDay } }),
    UserModel.countDocuments({ createdAt: { $gte: sinceWeek } }),
    UserModel.countDocuments({ createdAt: { $gte: sinceMonth } }),
    FarmPlanModel.countDocuments(),
    LandModel.countDocuments(),
    LandModel.countDocuments({ status: 'available' }),
    LandModel.countDocuments({ status: 'pending-verification' }),
    AgreementModel.countDocuments(),
    AgreementModel.countDocuments({ status: 'active' }),
    WorkerProfileModel.countDocuments(),
    WorkerProfileModel.countDocuments({ 'identityVerification.status': 'verified' }),
    UserVerificationModel.countDocuments({ status: { $in: ['pending', 'under-review'] } }),
    UserSessionModel.countDocuments({ disconnectedAt: { $exists: false } }),
  ]);
  return {
    generatedAt: new Date(),
    users: { total: totalUsers, active: activeUsers, pending: Math.max(totalUsers - activeUsers - suspendedUsers, 0), suspended: suspendedUsers, verified: 0, newToday, newThisWeek, newThisMonth },
    farms: { total: totalFarms, active: totalFarms },
    lands: { total: totalLands, published: publishedLands, pending: pendingLands },
    agreements: { total: totalAgreements, active: activeAgreements },
    workers: { total: totalWorkers, verified: verifiedWorkers },
    alerts: { pendingVerifications, suspendedUsers, failedLogins: await LoginHistoryModel.countDocuments({ success: false, createdAt: { $gte: sinceDay } }), suspiciousSessions: sessions },
  };
}

export async function listAdminUsers(req: AuthenticatedRequest, query: Record<string, unknown>) {
  const limit = Number(query.limit ?? 25);
  const canViewPrivate = hasAdminPermission(req.admin!, ADMIN_PERMISSIONS.USERS_VIEW_PRIVATE);
  const filter: FilterQuery<unknown> = {};
  if (query.role) filter.role = query.role;
  if (query.q) {
    const raw = String(query.q);
    if (/^[a-f\d]{24}$/i.test(raw)) filter._id = raw;
    else {
      const regex = new RegExp(escapeRegex(raw).slice(0, 80), 'i');
      filter.$or = canViewPrivate ? [{ name: regex }, { email: regex }, { phone: regex }] : [{ name: regex }];
    }
  }
  if (query.createdFrom || query.createdTo) filter.createdAt = { ...(query.createdFrom ? { $gte: query.createdFrom } : {}), ...(query.createdTo ? { $lte: query.createdTo } : {}) };
  if (query.lastLoginFrom || query.lastLoginTo) filter.lastLoginAt = { ...(query.lastLoginFrom ? { $gte: query.lastLoginFrom } : {}), ...(query.lastLoginTo ? { $lte: query.lastLoginTo } : {}) };
  if (query.state) filter['location.state'] = new RegExp(escapeRegex(String(query.state)), 'i');
  if (query.city) filter['location.city'] = new RegExp(escapeRegex(String(query.city)), 'i');
  if (query.cursor) filter._id = { $lt: query.cursor };
  if (query.status === 'active') filter.isActive = true;
  if (query.status === 'deactivated') filter.isActive = false;
  const sort: Record<string, SortOrder> = query.sort === 'oldest' ? { createdAt: 1 } : query.sort === 'last-login' ? { lastLoginAt: -1 } : query.sort === 'name' ? { name: 1 } : { createdAt: -1 };
  const users = await UserModel.find(filter).sort(sort).limit(limit).lean();
  return { users: users.map((user) => safeUser(user, canViewPrivate)), nextCursor: users.at(-1)?._id?.toString() ?? null };
}

export async function getAdminUser(req: AuthenticatedRequest, userId: string) {
  const canViewPrivate = hasAdminPermission(req.admin!, ADMIN_PERMISSIONS.USERS_VIEW_PRIVATE);
  const user = await UserModel.findById(userId).lean();
  if (!user) throw new AppError('User not found.', 404);
  const [verifications, activities, loginHistory, sessions, lands, applications, agreements, statusHistory, reports, notes] = await Promise.all([
    UserVerificationModel.find({ userId }).sort({ updatedAt: -1 }).lean(),
    NotificationModel.find({ receiverId: userId }).sort({ createdAt: -1 }).limit(10).lean(),
    canViewPrivate ? LoginHistoryModel.find({ userId }).sort({ createdAt: -1 }).limit(10).lean() : [],
    canViewPrivate ? UserSessionModel.find({ userId }).sort({ connectedAt: -1 }).limit(10).lean() : [],
    LandModel.find({ ownerId: userId }).select('title status createdAt').limit(10).lean(),
    ApplicationModel.find({ applicantId: userId }).select('status createdAt').limit(10).lean(),
    AgreementModel.find({ $or: [{ ownerId: userId }, { applicantId: userId }] }).select('status createdAt').limit(10).lean(),
    UserStatusHistoryModel.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
    [],
    AdminInternalNoteModel.find({ userId, deletedAt: { $exists: false } }).sort({ createdAt: -1 }).limit(20).lean(),
  ]);
  return { user: safeUser(user, canViewPrivate), verifications, activities, loginHistory, sessions, farms: [], lands, applications, agreements, workerAssignments: [], reports, notes, statusHistory };
}

export async function updateAdminUser(req: AuthenticatedRequest, userId: string, input: Record<string, unknown>) {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError('User not found.', 404);
  const oldValue = user.toObject();
  Object.assign(user, input);
  await user.save();
  await writeAdminAction(req, { action: 'user-updated', targetType: 'user', targetId: userId, oldValue: asRecord(oldValue), newValue: asRecord(user.toObject()) });
  return { user: safeUser(asRecord(user.toObject()), true) };
}

export async function changeUserStatus(req: AuthenticatedRequest, userId: string, input: { status: string; reason: string; duration?: string; restrictions?: string[]; expiresAt?: Date | null }) {
  if (req.user!.id === userId) throw new AppError('Admins cannot change their own account status.', 400);
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError('User not found.', 404);
  const targetAdmin = await AdminProfileModel.findOne({ userId, status: 'active' }).populate('roleIds').lean();
  if (targetAdmin && !req.admin!.isSuperAdmin) throw new AppError('Only super admins can change protected admin accounts.', 403);
  const expiresAt = input.expiresAt ?? (input.duration ? durationToExpiry(input.duration) : undefined);
  const previousStatus = user.isActive ? 'active' : 'deactivated';
  if (['suspended', 'blocked', 'deactivated', 'deleted'].includes(input.status)) user.isActive = false;
  if (input.status === 'active') user.isActive = true;
  await user.save();
  await UserStatusHistoryModel.create({ userId, previousStatus, newStatus: input.status, reason: input.reason, changedBy: req.user!.id, expiresAt, metadata: { restrictions: input.restrictions } });
  if (['suspended', 'blocked', 'deactivated', 'deleted'].includes(input.status)) await RefreshTokenModel.updateMany({ userId, revokedAt: { $exists: false } }, { revokedAt: new Date() });
  await createNotification({ receiverId: userId, senderId: req.user!.id, title: 'Account status updated', message: input.reason, type: 'admin-user-status', category: 'admin', priority: 'high', actionUrl: '/profile', metadata: { status: input.status } });
  await writeAdminAction(req, { action: `user-${input.status}`, targetType: 'user', targetId: userId, reason: input.reason, newValue: { status: input.status, expiresAt } });
  return { user: safeUser(asRecord(user.toObject()), true), status: input.status, expiresAt };
}

export async function listUserSessions(userId: string) {
  const [sessions, refreshTokens] = await Promise.all([
    UserSessionModel.find({ userId }).sort({ connectedAt: -1 }).limit(50).lean(),
    RefreshTokenModel.find({ userId }).sort({ createdAt: -1 }).limit(50).lean(),
  ]);
  return { sessions, refreshTokens: refreshTokens.map((token) => ({ id: token._id, createdAt: token.createdAt, expiresAt: token.expiresAt, revokedAt: token.revokedAt, createdByIp: token.createdByIp, userAgent: token.userAgent })) };
}

export async function revokeUserSession(req: AuthenticatedRequest, userId: string, sessionId?: string) {
  if (sessionId) await UserSessionModel.updateOne({ _id: sessionId, userId }, { disconnectedAt: new Date() });
  else await RefreshTokenModel.updateMany({ userId, revokedAt: { $exists: false } }, { revokedAt: new Date() });
  await createNotification({ receiverId: userId, senderId: req.user!.id, title: 'Session security update', message: 'An admin changed your active sessions.', type: 'admin-session-revoked', category: 'security', priority: 'high' });
  await writeAdminAction(req, { action: sessionId ? 'session-revoked' : 'sessions-logout-all', targetType: 'user', targetId: userId });
  return { revoked: true };
}

export async function listLoginHistory(userId: string, query: Record<string, unknown>) {
  const filter: FilterQuery<unknown> = { userId };
  if (query.success !== undefined) filter.success = query.success;
  if (query.suspicious) filter.riskFlags = { $exists: true, $ne: [] };
  if (query.dateFrom || query.dateTo) filter.createdAt = { ...(query.dateFrom ? { $gte: query.dateFrom } : {}), ...(query.dateTo ? { $lte: query.dateTo } : {}) };
  const history = await LoginHistoryModel.find(filter).sort({ createdAt: -1 }).limit(Number(query.limit ?? 25)).lean();
  return { history };
}

export async function listVerifications(query: Record<string, unknown>) {
  const filter: FilterQuery<unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.type) filter.verificationType = query.type;
  if (query.assignedReviewer) filter.reviewedBy = query.assignedReviewer;
  const verifications = await UserVerificationModel.find(filter).sort({ createdAt: -1 }).limit(Number(query.limit ?? 25)).populate('userId', 'name email role avatar').lean();
  return { verifications };
}

export async function getVerification(id: string) {
  const verification = await UserVerificationModel.findById(id).populate('userId', 'name email role avatar').lean();
  if (!verification) throw new AppError('Verification not found.', 404);
  return { verification };
}

export async function transitionVerification(req: AuthenticatedRequest, id: string, action: 'assign' | 'start-review' | 'approve' | 'reject' | 'request-resubmission', input: Record<string, unknown>) {
  const verification = await UserVerificationModel.findById(id);
  if (!verification) throw new AppError('Verification not found.', 404);
  const oldValue = verification.toObject();
  if (action === 'assign') verification.reviewedBy = input.reviewerId as never;
  if (action === 'start-review') verification.status = 'under-review';
  if (action === 'approve') {
    verification.status = 'approved';
    verification.reviewNotes = input.reviewNotes as string | undefined;
    verification.expiresAt = input.expiresAt as Date | undefined;
    verification.reviewedBy = req.user!.id as never;
    verification.reviewedAt = new Date();
  }
  if (action === 'reject') {
    verification.status = 'rejected';
    verification.rejectionReason = input.reason as string;
    verification.reviewNotes = input.reviewNotes as string | undefined;
    verification.reviewedBy = req.user!.id as never;
    verification.reviewedAt = new Date();
  }
  if (action === 'request-resubmission') {
    verification.status = 'needs-resubmission';
    verification.rejectionReason = input.reason as string;
    verification.reviewedBy = req.user!.id as never;
    verification.reviewedAt = new Date();
  }
  await verification.save();
  await createNotification({ receiverId: verification.userId.toString(), senderId: req.user!.id, title: 'Verification updated', message: `Your ${verification.verificationType} verification is ${verification.status}.`, type: 'admin-verification', category: 'admin', priority: 'high' });
  await writeAdminAction(req, { action: `verification-${action}`, targetType: 'user-verification', targetId: id, oldValue: asRecord(oldValue), newValue: asRecord(verification.toObject()) });
  return { verification };
}

export async function listAdminAccounts() {
  const admins = await AdminProfileModel.find().populate('userId', 'name email role isActive').populate('roleIds').sort({ createdAt: -1 }).lean();
  return { admins };
}

export async function getAdminAccount(adminId: string) {
  const admin = await AdminProfileModel.findById(adminId).populate('userId', 'name email role isActive').populate('roleIds').lean();
  if (!admin) throw new AppError('Admin profile not found.', 404);
  const override = await AdminPermissionOverrideModel.findOne({ adminProfileId: adminId }).lean();
  return { admin, override };
}

export async function createAdminAccount(req: AuthenticatedRequest, input: Record<string, unknown>) {
  const user = await UserModel.findById(input.userId);
  if (!user) throw new AppError('User not found.', 404);
  user.role = 'admin';
  await user.save();
  const profile = await AdminProfileModel.findOneAndUpdate(
    { userId: input.userId },
    { ...input, adminCode: `ADM-${String(input.userId).slice(-8).toUpperCase()}`, displayName: user.name, status: 'active', activatedAt: new Date(), createdBy: req.user!.id, updatedBy: req.user!.id },
    { upsert: true, new: true },
  );
  await writeAdminAction(req, { action: 'admin-created', targetType: 'admin-profile', targetId: profile._id.toString(), newValue: asRecord(profile.toObject()) });
  return { profile };
}

export async function updateAdminAccount(req: AuthenticatedRequest, adminId: string, input: Record<string, unknown>) {
  const profile = await AdminProfileModel.findById(adminId);
  if (!profile) throw new AppError('Admin profile not found.', 404);
  const oldValue = profile.toObject();
  Object.assign(profile, input, { updatedBy: req.user!.id, permissionsVersion: profile.permissionsVersion + 1 });
  await profile.save();
  await writeAdminAction(req, { action: 'admin-updated', targetType: 'admin-profile', targetId: adminId, oldValue: asRecord(oldValue), newValue: asRecord(profile.toObject()) });
  return { profile };
}

export async function updateAdminStatus(req: AuthenticatedRequest, adminId: string, status: 'active' | 'inactive' | 'suspended') {
  const profile = await AdminProfileModel.findById(adminId);
  if (!profile) throw new AppError('Admin profile not found.', 404);
  if (profile.userId.toString() === req.user!.id) throw new AppError('Admins cannot change their own admin status.', 400);
  const oldValue = profile.toObject();
  profile.status = status;
  profile.updatedBy = req.user!.id as never;
  if (status === 'active' && !profile.activatedAt) profile.activatedAt = new Date();
  profile.permissionsVersion += 1;
  await profile.save();
  await writeAdminAction(req, { action: `admin-${status}`, targetType: 'admin-profile', targetId: adminId, oldValue: asRecord(oldValue), newValue: asRecord(profile.toObject()) });
  return { profile };
}

export async function setAdminPermissionOverride(req: AuthenticatedRequest, adminId: string, input: { allow: string[]; deny: string[]; reason: string }) {
  const profile = await AdminProfileModel.findById(adminId);
  if (!profile) throw new AppError('Admin profile not found.', 404);
  const override = await AdminPermissionOverrideModel.findOneAndUpdate({ adminProfileId: adminId }, { ...input, updatedBy: req.user!.id, $setOnInsert: { createdBy: req.user!.id } }, { upsert: true, new: true });
  profile.permissionsVersion += 1;
  await profile.save();
  await writeAdminAction(req, { action: 'admin-permission-override', targetType: 'admin-profile', targetId: adminId, reason: input.reason, newValue: { allow: input.allow, deny: input.deny } });
  return { override };
}

export async function listRoles() {
  await ensureSystemAdminRoles();
  const roles = await AdminRoleModel.find().sort({ slug: 1 }).lean();
  return { roles };
}

export async function getRole(roleId: string) {
  const role = await AdminRoleModel.findById(roleId).lean();
  if (!role) throw new AppError('Role not found.', 404);
  return { role };
}

export async function createRole(req: AuthenticatedRequest, input: Record<string, unknown>) {
  const role = await AdminRoleModel.create({ ...input, createdBy: req.user!.id, updatedBy: req.user!.id });
  await writeAdminAction(req, { action: 'admin-role-created', targetType: 'admin-role', targetId: role._id.toString(), newValue: asRecord(role.toObject()) });
  return { role };
}

export async function updateRole(req: AuthenticatedRequest, roleId: string, input: Record<string, unknown>) {
  const role = await AdminRoleModel.findById(roleId);
  if (!role) throw new AppError('Role not found.', 404);
  const oldValue = role.toObject();
  Object.assign(role, input, { updatedBy: req.user!.id });
  await role.save();
  await AdminProfileModel.updateMany({ roleIds: role._id }, { $inc: { permissionsVersion: 1 } });
  await writeAdminAction(req, { action: 'admin-role-updated', targetType: 'admin-role', targetId: roleId, oldValue: asRecord(oldValue), newValue: asRecord(role.toObject()) });
  return { role };
}

export async function deleteRole(req: AuthenticatedRequest, roleId: string) {
  const role = await AdminRoleModel.findById(roleId);
  if (!role) throw new AppError('Role not found.', 404);
  if (role.isSystemRole) throw new AppError('System roles cannot be deleted.', 400);
  if (await AdminProfileModel.exists({ roleIds: role._id })) throw new AppError('Role is assigned to active admin profiles.', 400);
  await role.deleteOne();
  await writeAdminAction(req, { action: 'admin-role-deleted', targetType: 'admin-role', targetId: roleId });
  return { deleted: true };
}

export async function listAdminAuditLogs(query: Record<string, unknown>) {
  const filter: FilterQuery<unknown> = {};
  if (query.adminId) filter.adminId = query.adminId;
  if (query.action) filter.action = query.action;
  if (query.targetType) filter.targetType = query.targetType;
  if (query.targetId) filter.targetId = query.targetId;
  if (query.result) filter.result = query.result;
  const logs = await AdminActionLogModel.find(filter).sort({ createdAt: -1 }).limit(Number(query.limit ?? 25)).lean();
  return { logs };
}

export async function getAdminAuditLog(auditLogId: string) {
  const log = await AdminActionLogModel.findById(auditLogId).lean();
  if (!log) throw new AppError('Admin audit log not found.', 404);
  return { log };
}

export async function savedViews(user: AuthenticatedUser, resource?: string) {
  const filter: Record<string, unknown> = { adminId: user.id };
  if (resource) filter.resourceType = resource;
  return { views: await AdminSavedViewModel.find(filter).sort({ updatedAt: -1 }).lean() };
}

export async function saveView(user: AuthenticatedUser, input: Record<string, unknown>, viewId?: string) {
  const payload = { ...input, adminId: user.id };
  const view = viewId ? await AdminSavedViewModel.findOneAndUpdate({ _id: viewId, adminId: user.id }, payload, { new: true }) : await AdminSavedViewModel.create(payload);
  if (!view) throw new AppError('Saved view not found.', 404);
  return { view };
}

export async function deleteSavedView(user: AuthenticatedUser, viewId: string) {
  await AdminSavedViewModel.deleteOne({ _id: viewId, adminId: user.id });
  return { deleted: true };
}

export async function userNotes(userId: string) {
  return { notes: await AdminInternalNoteModel.find({ userId, deletedAt: { $exists: false } }).sort({ createdAt: -1 }).lean() };
}

export async function createUserNote(req: AuthenticatedRequest, userId: string, input: Record<string, unknown>) {
  const note = await AdminInternalNoteModel.create({ ...input, userId, authorId: req.user!.id });
  await writeAdminAction(req, { action: 'admin-note-created', targetType: 'user', targetId: userId, newValue: { visibility: input.visibility } });
  return { note };
}

export async function updateUserNote(req: AuthenticatedRequest, userId: string, noteId: string, input: Record<string, unknown>) {
  const note = await AdminInternalNoteModel.findOneAndUpdate({ _id: noteId, userId, deletedAt: { $exists: false } }, input, { new: true });
  if (!note) throw new AppError('Note not found.', 404);
  await writeAdminAction(req, { action: 'admin-note-updated', targetType: 'admin-note', targetId: noteId });
  return { note };
}

export async function deleteUserNote(req: AuthenticatedRequest, userId: string, noteId: string) {
  await AdminInternalNoteModel.updateOne({ _id: noteId, userId }, { deletedAt: new Date(), deletedBy: req.user!.id });
  await writeAdminAction(req, { action: 'admin-note-deleted', targetType: 'admin-note', targetId: noteId });
  return { deleted: true };
}

export async function startImpersonation(req: AuthenticatedRequest, targetUserId: string, input: { reason: string; ticketReference?: string }) {
  if (!env.adminImpersonationEnabled) throw new AppError('Impersonation is disabled.', 403);
  if (req.user!.id === targetUserId) throw new AppError('Cannot impersonate yourself.', 400);
  if (await AdminProfileModel.exists({ userId: targetUserId, status: 'active' })) throw new AppError('Admin accounts cannot be impersonated.', 403);
  if (await ImpersonationSessionModel.exists({ adminId: req.user!.id, status: 'active', expiresAt: { $gt: new Date() } })) throw new AppError('An impersonation session is already active.', 400);
  const expiresAt = new Date(Date.now() + env.adminImpersonationMaxMinutes * 60_000);
  const session = await ImpersonationSessionModel.create({ adminId: req.user!.id, targetUserId, reason: input.reason, ticketReference: input.ticketReference, expiresAt, ip: req.ip, device: req.get('user-agent') });
  await writeAdminAction(req, { action: 'impersonation-started', targetType: 'user', targetId: targetUserId, reason: input.reason });
  return { session };
}

export async function activeImpersonation(user: AuthenticatedUser) {
  const session = await ImpersonationSessionModel.findOne({ adminId: user.id, status: 'active', expiresAt: { $gt: new Date() } }).lean();
  return { session };
}

export async function stopImpersonation(req: AuthenticatedRequest) {
  const session = await ImpersonationSessionModel.findOneAndUpdate({ adminId: req.user!.id, status: 'active' }, { status: 'ended', endedAt: new Date(), endedBy: req.user!.id }, { new: true });
  if (!session) throw new AppError('No active impersonation session.', 404);
  await writeAdminAction(req, { action: 'impersonation-ended', targetType: 'user', targetId: session.targetUserId.toString() });
  return { session };
}
