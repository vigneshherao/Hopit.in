import { AgreementModel } from '@/models/agreement.model.js';
import { ConversationModel } from '@/models/conversation.model.js';
import { ConversationBlockModel } from '@/models/conversation-block.model.js';
import { ConversationMemberModel, type ConversationMemberDocument } from '@/models/conversation-member.model.js';
import { FarmPlanModel } from '@/models/farm-plan.model.js';
import { FarmTaskModel } from '@/models/farm-task.model.js';
import { AppError } from '@/utils/app-error.js';

export async function getActiveMember(conversationId: string, userId: string): Promise<ConversationMemberDocument> {
  const member = await ConversationMemberModel.findOne({ conversationId, userId, status: 'active' });
  if (!member) throw new AppError('Conversation not found.', 404);
  if (!member.permissions.canViewHistory) throw new AppError('You cannot view this conversation.', 403);
  return member;
}

export async function requireSendPermission(conversationId: string, userId: string): Promise<ConversationMemberDocument> {
  const member = await getActiveMember(conversationId, userId);
  if (!member.permissions.canSendMessages) throw new AppError('You cannot send messages in this conversation.', 403);
  return member;
}

export async function requireManageMembers(conversationId: string, userId: string): Promise<ConversationMemberDocument> {
  const member = await getActiveMember(conversationId, userId);
  if (!member.permissions.canAddMembers && !member.permissions.canRemoveMembers) throw new AppError('You cannot manage members in this conversation.', 403);
  return member;
}

export async function ensureNotBlocked(conversationId: string, senderId: string): Promise<void> {
  const conversation = await ConversationModel.findById(conversationId).select('type directParticipantKey').lean();
  if (!conversation || conversation.type !== 'direct') return;
  const members = await ConversationMemberModel.find({ conversationId, status: 'active' }).select('userId').lean();
  const memberIds = members.map((member) => member.userId.toString());
  const otherId = memberIds.find((id) => id !== senderId);
  if (!otherId) return;
  const block = await ConversationBlockModel.findOne({
    $or: [
      { blockerId: senderId, blockedUserId: otherId },
      { blockerId: otherId, blockedUserId: senderId },
    ],
  }).lean();
  if (block) throw new AppError('Direct messages are blocked for this conversation.', 403);
}

export async function validateEntityAccess(input: { type: string; entityId?: string; userId: string; role: string }): Promise<void> {
  if (input.role === 'admin') return;
  if (input.type === 'farm-team' && input.entityId) {
    const plan = await FarmPlanModel.findById(input.entityId).select('ownerId').lean();
    if (!plan || plan.ownerId.toString() !== input.userId) throw new AppError('Farm plan not found.', 404);
  }
  if (input.type === 'agreement' && input.entityId) {
    const agreement = await AgreementModel.findById(input.entityId).select('ownerId applicantId').lean();
    if (!agreement || ![agreement.ownerId.toString(), agreement.applicantId.toString()].includes(input.userId)) throw new AppError('Agreement not found.', 404);
  }
  if (input.type === 'task' && input.entityId) {
    const task = await FarmTaskModel.findById(input.entityId).select('ownerId assignedWorker').lean();
    if (!task || ![task.ownerId?.toString(), task.assignedWorker?.toString()].includes(input.userId)) throw new AppError('Task not found.', 404);
  }
}
