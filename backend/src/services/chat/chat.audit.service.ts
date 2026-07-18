import { ChatAuditLogModel } from '@/models/chat-audit-log.model.js';
import type { CHAT_AUDIT_ACTIONS } from '@/constants/chat.constants.js';

export async function auditChat(input: {
  conversationId?: string;
  messageId?: string;
  actorId: string;
  action: (typeof CHAT_AUDIT_ACTIONS)[number];
  metadata?: Record<string, unknown>;
}) {
  await ChatAuditLogModel.create(input);
}
