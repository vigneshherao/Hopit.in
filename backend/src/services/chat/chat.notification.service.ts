import { ConversationMemberModel } from '@/models/conversation-member.model.js';
import { createNotification } from '@/services/notification/notification.service.js';

export async function notifyConversationMembers(input: { conversationId: string; senderId: string; title: string; preview: string; type?: string }) {
  const members = await ConversationMemberModel.find({ conversationId: input.conversationId, status: 'active', userId: { $ne: input.senderId } }).lean();
  await Promise.all(
    members
      .filter((member) => member.notificationLevel !== 'none')
      .filter((member) => !member.isMuted || (member.mutedUntil && member.mutedUntil < new Date()))
      .map((member) =>
        createNotification({
          receiverId: member.userId.toString(),
          senderId: input.senderId,
          title: input.title,
          message: input.preview,
          type: input.type ?? 'chat-message',
          category: 'chat',
          priority: 'medium',
          actionUrl: `/messages/${input.conversationId}`,
          metadata: { conversationId: input.conversationId },
        }),
      ),
  );
}
