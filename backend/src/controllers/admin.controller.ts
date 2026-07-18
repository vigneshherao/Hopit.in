import type { Response } from 'express';
import { ADMIN_PERMISSION_CATALOG } from '@/constants/admin.constants.js';
import { activeImpersonation, changeUserStatus, createAdminAccount, createRole, createUserNote, deleteRole, deleteSavedView, deleteUserNote, getAdminAccount, getAdminAuditLog, getAdminMe, getAdminUser, getDashboardOverview, getRole, getVerification, listAdminAccounts, listAdminAuditLogs, listAdminUsers, listLoginHistory, listRoles, listUserSessions, listVerifications, revokeUserSession, saveView, savedViews, setAdminPermissionOverride, startImpersonation, stopImpersonation, transitionVerification, updateAdminAccount, updateAdminMe, updateAdminStatus, updateAdminUser, updateRole, updateUserNote, userNotes } from '@/services/admin.service.js';
import type { AuthenticatedRequest } from '@/types/http.js';
import { sendSuccess } from '@/utils/api-response.js';

export async function adminMeController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Admin profile retrieved.', await getAdminMe(req.user!.id)); }
export async function updateAdminMeController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Admin profile updated.', await updateAdminMe(req, req.body)); }
export async function adminOverviewController(_req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Admin overview retrieved.', await getDashboardOverview()); }
export async function adminUsersController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Users retrieved.', await listAdminUsers(req, req.query)); }
export async function adminUserController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'User retrieved.', await getAdminUser(req, req.params.userId as string)); }
export async function updateAdminUserController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'User updated.', await updateAdminUser(req, req.params.userId as string, req.body)); }
export async function suspendUserController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'User suspended.', await changeUserStatus(req, req.params.userId as string, { ...req.body, status: 'suspended' })); }
export async function restrictUserController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'User restricted.', await changeUserStatus(req, req.params.userId as string, { ...req.body, status: 'restricted' })); }
export async function restoreUserController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'User restored.', await changeUserStatus(req, req.params.userId as string, { ...req.body, status: 'active' })); }
export async function deactivateUserController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'User deactivated.', await changeUserStatus(req, req.params.userId as string, { ...req.body, status: 'deactivated' })); }
export async function reactivateUserController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'User reactivated.', await changeUserStatus(req, req.params.userId as string, { ...req.body, status: 'active' })); }
export async function deleteUserController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'User deactivated.', await changeUserStatus(req, req.params.userId as string, { reason: req.body?.reason ?? 'Admin delete request', status: 'deleted' })); }
export async function userSessionsController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'User sessions retrieved.', await listUserSessions(req.params.userId as string)); }
export async function adminOwnSessionsController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Admin sessions retrieved.', await listUserSessions(req.user!.id)); }
export async function revokeUserSessionController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'User session revoked.', await revokeUserSession(req, req.params.userId as string, req.params.sessionId as string)); }
export async function revokeAdminOwnSessionController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Admin session revoked.', await revokeUserSession(req, req.user!.id, req.params.sessionId as string)); }
export async function logoutAllUserSessionsController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'User sessions revoked.', await revokeUserSession(req, req.params.userId as string)); }
export async function logoutAllAdminSessionsController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Admin sessions revoked.', await revokeUserSession(req, req.user!.id)); }
export async function loginHistoryController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Login history retrieved.', await listLoginHistory(req.params.userId as string, req.query)); }
export async function verificationsController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Verifications retrieved.', await listVerifications(req.query)); }
export async function verificationController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Verification retrieved.', await getVerification(req.params.verificationId as string)); }
export async function assignVerificationController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Verification assigned.', await transitionVerification(req, req.params.verificationId as string, 'assign', req.body)); }
export async function startVerificationReviewController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Verification review started.', await transitionVerification(req, req.params.verificationId as string, 'start-review', req.body)); }
export async function approveVerificationController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Verification approved.', await transitionVerification(req, req.params.verificationId as string, 'approve', req.body)); }
export async function rejectVerificationController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Verification rejected.', await transitionVerification(req, req.params.verificationId as string, 'reject', req.body)); }
export async function resubmitVerificationController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Verification resubmission requested.', await transitionVerification(req, req.params.verificationId as string, 'request-resubmission', req.body)); }
export async function adminAccountsController(_req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Admin accounts retrieved.', await listAdminAccounts()); }
export async function createAdminController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 201, 'Admin account created.', await createAdminAccount(req, req.body)); }
export async function adminAccountController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Admin account retrieved.', await getAdminAccount(req.params.adminId as string)); }
export async function updateAdminController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Admin account updated.', await updateAdminAccount(req, req.params.adminId as string, req.body)); }
export async function activateAdminController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Admin account activated.', await updateAdminStatus(req, req.params.adminId as string, 'active')); }
export async function deactivateAdminController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Admin account deactivated.', await updateAdminStatus(req, req.params.adminId as string, 'inactive')); }
export async function adminRolesController(_req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Admin roles retrieved.', await listRoles()); }
export async function adminRoleController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Admin role retrieved.', await getRole(req.params.roleId as string)); }
export async function createRoleController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 201, 'Admin role created.', await createRole(req, req.body)); }
export async function updateRoleController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Admin role updated.', await updateRole(req, req.params.roleId as string, req.body)); }
export async function deleteRoleController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Admin role deleted.', await deleteRole(req, req.params.roleId as string)); }
export async function permissionsController(_req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Admin permissions retrieved.', { permissions: ADMIN_PERMISSION_CATALOG }); }
export async function permissionOverrideController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Permission override saved.', await setAdminPermissionOverride(req, req.params.adminId as string, req.body)); }
export async function auditLogsController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Admin audit logs retrieved.', await listAdminAuditLogs(req.query)); }
export async function auditLogController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Admin audit log retrieved.', await getAdminAuditLog(req.params.auditLogId as string)); }
export async function savedViewsController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Saved views retrieved.', await savedViews(req.user!, req.query.resourceType as string | undefined)); }
export async function createSavedViewController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 201, 'Saved view created.', await saveView(req.user!, req.body)); }
export async function updateSavedViewController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Saved view updated.', await saveView(req.user!, req.body, req.params.viewId as string)); }
export async function deleteSavedViewController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Saved view deleted.', await deleteSavedView(req.user!, req.params.viewId as string)); }
export async function notesController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Internal notes retrieved.', await userNotes(req.params.userId as string)); }
export async function createNoteController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 201, 'Internal note created.', await createUserNote(req, req.params.userId as string, req.body)); }
export async function updateNoteController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Internal note updated.', await updateUserNote(req, req.params.userId as string, req.params.noteId as string, req.body)); }
export async function deleteNoteController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Internal note deleted.', await deleteUserNote(req, req.params.userId as string, req.params.noteId as string)); }
export async function startImpersonationController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 201, 'Impersonation session started.', await startImpersonation(req, req.params.userId as string, req.body)); }
export async function activeImpersonationController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Active impersonation retrieved.', await activeImpersonation(req.user!)); }
export async function stopImpersonationController(req: AuthenticatedRequest, res: Response) { sendSuccess(res, 200, 'Impersonation stopped.', await stopImpersonation(req)); }
