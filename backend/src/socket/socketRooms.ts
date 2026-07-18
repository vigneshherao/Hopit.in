import { AgreementModel } from '@/models/agreement.model.js';
import { ConversationMemberModel } from '@/models/conversation-member.model.js';
import { FarmPlanModel } from '@/models/farm-plan.model.js';
import { FarmTaskModel } from '@/models/farm-task.model.js';

export function userRoom(userId: string): string {
  return `user:${userId}`;
}

export function farmRoom(farmId: string): string {
  return `farm:${farmId}`;
}

export function agreementRoom(agreementId: string): string {
  return `agreement:${agreementId}`;
}

export function taskRoom(taskId: string): string {
  return `task:${taskId}`;
}

export function chatRoom(conversationId: string): string {
  return `conversation:${conversationId}`;
}

export function adminRoom(): string {
  return 'admin';
}

export async function canJoinRoom(input: { room: string; userId: string; role: string }): Promise<boolean> {
  const [kind, id] = input.room.split(':');
  if (!kind) return false;
  if (input.role === 'admin') return ['user', 'farm', 'agreement', 'task', 'conversation', 'admin'].includes(kind);
  if (kind === 'user') return id === input.userId;
  if (kind === 'admin') return false;
  if (!id) return false;

  if (kind === 'farm') {
    const farm = await FarmPlanModel.findById(id).select('ownerId').lean();
    return Boolean(farm && farm.ownerId.toString() === input.userId);
  }

  if (kind === 'agreement') {
    const agreement = await AgreementModel.findById(id).select('ownerId applicantId').lean();
    return Boolean(agreement && [agreement.ownerId.toString(), agreement.applicantId.toString()].includes(input.userId));
  }

  if (kind === 'task') {
    const task = await FarmTaskModel.findById(id).select('ownerId assignedWorker').lean();
    return Boolean(task && [task.ownerId?.toString(), task.assignedWorker?.toString()].includes(input.userId));
  }

  if (kind === 'conversation') {
    const member = await ConversationMemberModel.exists({ conversationId: id, userId: input.userId, status: 'active' });
    return Boolean(member);
  }

  return false;
}
