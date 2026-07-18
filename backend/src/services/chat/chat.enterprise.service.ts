import mongoose from 'mongoose';
import { AnnouncementModel } from '@/models/announcement.model.js';
import { ChatAttachmentModel } from '@/models/chat-attachment.model.js';
import { ConversationActivityModel } from '@/models/conversation-activity.model.js';
import { ConversationAnalyticsModel } from '@/models/conversation-analytics.model.js';
import { ConversationMemberModel } from '@/models/conversation-member.model.js';
import { ConversationModel } from '@/models/conversation.model.js';
import { FarmCalendarEventModel } from '@/models/farm-calendar-event.model.js';
import { FarmTaskModel } from '@/models/farm-task.model.js';
import { MessageModel } from '@/models/message.model.js';
import { MessageReactionModel } from '@/models/message-reaction.model.js';
import { PinnedMessageModel } from '@/models/pinned-message.model.js';
import { ReportedItemModel } from '@/models/reported-item.model.js';
import { SharedNoteModel } from '@/models/shared-note.model.js';
import type { AuthenticatedUser } from '@/types/http.js';
import { AppError } from '@/utils/app-error.js';
import { getActiveMember } from '@/services/chat/chat.permissions.js';
import { writeAuditLog, listAuditLogs } from '@/services/chat/chat.audit-log.service.js';
import { emitConversation } from '@/services/chat/chat.socket.js';
import { CHAT_SOCKET_EVENTS } from '@/constants/chat.constants.js';

export { listAuditLogs };

export async function recordConversationActivity(input: {
  conversationId: string;
  actorId?: string;
  activityType: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  const activity = await ConversationActivityModel.create(input);
  emitConversation(input.conversationId, 'activity-created', { activity });
  return activity;
}

export async function listConversationTimeline(user: AuthenticatedUser, query: Record<string, unknown>) {
  if (!query.conversationId) throw new AppError('Conversation id is required.', 400);
  await getActiveMember(String(query.conversationId), user.id);
  const activities = await ConversationActivityModel.find({ conversationId: query.conversationId }).sort({ createdAt: -1 }).limit(Number(query.limit ?? 50)).populate('actorId', 'name avatar role').lean();
  return { activities };
}

export async function getTeamWorkspace(user: AuthenticatedUser, conversationId: string) {
  await getActiveMember(conversationId, user.id);
  const conversation = await ConversationModel.findById(conversationId).lean();
  if (!conversation) throw new AppError('Conversation not found.', 404);
  const now = new Date();
  const soon = new Date(now.getTime() + 14 * 24 * 60 * 60_000);
  const [announcements, notes, recentFiles, recentDiscussions, pins, tasks, events, activities, analytics] = await Promise.all([
    AnnouncementModel.find({ conversationId, $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }] }).sort({ createdAt: -1 }).limit(5).lean(),
    SharedNoteModel.find({ conversationId }).sort({ updatedAt: -1 }).limit(5).lean(),
    ChatAttachmentModel.find({ conversationId }).sort({ createdAt: -1 }).limit(8).lean(),
    MessageModel.find({ conversationId, isDeletedForEveryone: false }).sort({ createdAt: -1 }).limit(8).lean(),
    PinnedMessageModel.find({ conversationId }).sort({ pinnedAt: -1 }).limit(5).populate('messageId').lean(),
    conversation.farmPlanId ? FarmTaskModel.find({ farmPlanId: conversation.farmPlanId, startDate: { $gte: now, $lte: soon } }).sort({ startDate: 1 }).limit(8).lean() : [],
    conversation.farmPlanId ? FarmCalendarEventModel.find({ farmPlanId: conversation.farmPlanId, startDate: { $gte: now, $lte: soon } }).sort({ startDate: 1 }).limit(8).lean() : [],
    ConversationActivityModel.find({ conversationId }).sort({ createdAt: -1 }).limit(12).populate('actorId', 'name avatar role').lean(),
    calculateConversationAnalytics(user, conversationId),
  ]);
  return { conversation, announcements, notes, recentFiles, recentDiscussions, pinnedMessages: pins, upcomingTasks: tasks, upcomingEvents: events, weatherAlerts: [], diseaseAlerts: [], monitoringReports: [], activities, analytics: analytics.analytics };
}

export async function calculateConversationAnalytics(user: AuthenticatedUser, conversationId: string) {
  await getActiveMember(conversationId, user.id);
  const now = new Date();
  const day = new Date(now.getTime() - 24 * 60 * 60_000);
  const week = new Date(now.getTime() - 7 * 24 * 60 * 60_000);
  const month = new Date(now.getTime() - 30 * 24 * 60 * 60_000);
  const [messageCount, attachmentCount, activeMembers, dailyMessages, weeklyMessages, monthlyMessages, reactionCount, threadCount, announcementCount, reactionStats] = await Promise.all([
    MessageModel.countDocuments({ conversationId, isDeletedForEveryone: false }),
    ChatAttachmentModel.countDocuments({ conversationId }),
    ConversationMemberModel.countDocuments({ conversationId, status: 'active' }),
    MessageModel.countDocuments({ conversationId, createdAt: { $gte: day } }),
    MessageModel.countDocuments({ conversationId, createdAt: { $gte: week } }),
    MessageModel.countDocuments({ conversationId, createdAt: { $gte: month } }),
    MessageReactionModel.countDocuments({ conversationId }),
    MessageModel.countDocuments({ conversationId, threadRootMessageId: { $exists: true } }),
    AnnouncementModel.countDocuments({ conversationId }),
    MessageReactionModel.aggregate([{ $match: { conversationId: new mongoose.Types.ObjectId(conversationId) } }, { $group: { _id: '$emoji', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 1 }]),
  ]);
  const analytics = await ConversationAnalyticsModel.findOneAndUpdate(
    { conversationId },
    { messageCount, attachmentCount, activeMembers, dailyMessages, weeklyMessages, monthlyMessages, reactionCount, threadCount, announcementCount, mostUsedReaction: reactionStats[0]?._id, calculatedAt: now },
    { upsert: true, new: true },
  ).lean();
  emitConversation(conversationId, CHAT_SOCKET_EVENTS.ANALYTICS_UPDATE, { analytics });
  return { analytics };
}

export async function getAnalyticsDashboard(user: AuthenticatedUser) {
  const memberships = await ConversationMemberModel.find({ userId: user.id, status: 'active' }).select('conversationId unreadCount').lean();
  const conversationIds = memberships.map((member) => member.conversationId);
  const [topConversations, messageDays, mostUsedReaction] = await Promise.all([
    ConversationAnalyticsModel.find({ conversationId: { $in: conversationIds } }).sort({ messageCount: -1 }).limit(10).populate('conversationId', 'title type farmPlanId agreementId').lean(),
    MessageModel.aggregate([{ $match: { conversationId: { $in: conversationIds } } }, { $group: { _id: { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }, { $limit: 30 }]),
    MessageReactionModel.aggregate([{ $match: { conversationId: { $in: conversationIds } } }, { $group: { _id: '$emoji', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 1 }]),
  ]);
  return {
    widgets: {
      unreadMessages: memberships.reduce((sum, member) => sum + (member.unreadCount ?? 0), 0),
      mostUsedReaction: mostUsedReaction[0]?._id ?? null,
      topConversation: topConversations[0] ?? null,
      activeConversationCount: memberships.length,
    },
    charts: { messagesPerDay: messageDays, topConversations },
  };
}

export async function createReport(user: AuthenticatedUser, input: { entityType: string; entityId: string; conversationId?: string; reason: string; description?: string }) {
  if (input.conversationId) await getActiveMember(input.conversationId, user.id);
  const report = await ReportedItemModel.create({ ...input, reporterId: user.id });
  await writeAuditLog({ userId: user.id, action: 'report-created', entity: input.entityType, entityId: input.entityId, newValue: { reason: input.reason } });
  emitConversation(input.conversationId ?? input.entityId, CHAT_SOCKET_EVENTS.REPORT_CREATED, { report });
  return { report };
}

export async function listReports(user: AuthenticatedUser, query: Record<string, unknown>) {
  if (user.role !== 'admin') throw new AppError('Admin access is required.', 403);
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.entityType) filter.entityType = query.entityType;
  const reports = await ReportedItemModel.find(filter).sort({ createdAt: -1 }).limit(Number(query.limit ?? 50)).populate('reporterId', 'name avatar role').lean();
  return { reports };
}

export async function moderateReport(user: AuthenticatedUser, reportId: string, input: { action: string; resolution?: string }) {
  if (user.role !== 'admin') throw new AppError('Admin access is required.', 403);
  const report = await ReportedItemModel.findById(reportId);
  if (!report) throw new AppError('Report not found.', 404);
  const oldValue = report.toObject();
  report.status = input.action === 'dismiss' ? 'dismissed' : 'resolved';
  report.resolution = input.resolution ?? input.action;
  report.resolvedBy = user.id as never;
  report.resolvedAt = new Date();
  await report.save();
  await writeAuditLog({ userId: user.id, action: `moderation-${input.action}`, entity: report.entityType, entityId: report.entityId.toString(), oldValue: oldValue as unknown as Record<string, unknown>, newValue: report.toObject() as unknown as Record<string, unknown> });
  if (input.action === 'delete-message' && report.entityType === 'message') await MessageModel.updateOne({ _id: report.entityId }, { isDeletedForEveryone: true, deletedForEveryoneAt: new Date(), deletedBy: user.id, text: '', normalizedText: '' });
  emitConversation(report.conversationId?.toString() ?? report.entityId.toString(), CHAT_SOCKET_EVENTS.MODERATION_UPDATE, { report });
  return { report };
}

export async function getNotificationDigestSettings(user: AuthenticatedUser) {
  return { settings: { userId: user.id, frequency: 'instant', channels: ['in-app', 'email', 'push'], providers: { push: 'web-push-ready', email: 'smtp-ready' } } };
}

export async function updateNotificationDigestSettings(user: AuthenticatedUser, input: { frequency: string; channels: string[] }) {
  await writeAuditLog({ userId: user.id, action: 'notification-digest-updated', entity: 'notification-preference', newValue: input });
  return { settings: { userId: user.id, ...input } };
}

export function detectSpamSignals(input: { text?: string; attachmentCount?: number }) {
  const links = (input.text ?? '').match(/https?:\/\//g)?.length ?? 0;
  const mentions = (input.text ?? '').match(/@\w+/g)?.length ?? 0;
  return {
    repeatedLinks: links >= 3,
    massMentions: mentions >= 8,
    spamAttachments: (input.attachmentCount ?? 0) > 8,
    shouldWarn: links >= 3 || mentions >= 8 || (input.attachmentCount ?? 0) > 8,
  };
}
