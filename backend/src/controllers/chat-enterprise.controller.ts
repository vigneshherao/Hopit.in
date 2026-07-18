import type { Response } from 'express';
import { calculateConversationAnalytics, createReport, getAnalyticsDashboard, getNotificationDigestSettings, getTeamWorkspace, listAuditLogs, listConversationTimeline, listReports, moderateReport, updateNotificationDigestSettings } from '@/services/chat/chat.enterprise.service.js';
import type { AuthenticatedRequest } from '@/types/http.js';
import { sendSuccess } from '@/utils/api-response.js';

export async function teamWorkspaceController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Team workspace retrieved.', await getTeamWorkspace(req.user!, req.params.conversationId as string));
}

export async function conversationTimelineController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Conversation timeline retrieved.', await listConversationTimeline(req.user!, req.query));
}

export async function conversationAnalyticsController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Conversation analytics retrieved.', await calculateConversationAnalytics(req.user!, req.params.conversationId as string));
}

export async function analyticsDashboardController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Chat analytics dashboard retrieved.', await getAnalyticsDashboard(req.user!));
}

export async function createReportController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 201, 'Report submitted.', await createReport(req.user!, req.body));
}

export async function reportsController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Reports retrieved.', await listReports(req.user!, req.query));
}

export async function moderateReportController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Moderation action completed.', await moderateReport(req.user!, req.params.reportId as string, req.body));
}

export async function auditLogsController(req: AuthenticatedRequest, res: Response) {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin access is required.' });
    return;
  }
  sendSuccess(res, 200, 'Audit logs retrieved.', await listAuditLogs(req.query));
}

export async function digestSettingsController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Notification digest settings retrieved.', await getNotificationDigestSettings(req.user!));
}

export async function updateDigestSettingsController(req: AuthenticatedRequest, res: Response) {
  sendSuccess(res, 200, 'Notification digest settings updated.', await updateNotificationDigestSettings(req.user!, req.body));
}
