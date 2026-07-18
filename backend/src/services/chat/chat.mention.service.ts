import { CHAT_SOCKET_EVENTS } from '@/constants/chat.constants.js';
import { ConversationMemberModel } from '@/models/conversation-member.model.js';
import { MessageMentionModel } from '@/models/message-mention.model.js';
import { emitConversation } from '@/services/chat/chat.socket.js';
import { createNotification } from '@/services/notification/notification.service.js';

const mentionPattern = /@([a-zA-Z][\w-]{1,40})/g;
const roleMentions = new Set(['farmer', 'manager', 'worker']);

export async function createMentionsFromText(input: { conversationId: string; messageId: string; mentionedBy: string; text?: string }) {
  const tokens = [...new Set([...(input.text ?? '').matchAll(mentionPattern)].map((match) => match[1].toLowerCase()))];
  if (!tokens.length) return [];

  const members = await ConversationMemberModel.find({ conversationId: input.conversationId, status: 'active', userId: { $ne: input.mentionedBy } })
    .populate('userId', 'name role')
    .lean();

  const mentionedIds = new Set<string>();
  for (const member of members) {
    const user = member.userId as unknown as { _id: { toString(): string }; name?: string; role?: string };
    const nameTokens = (user.name ?? '').toLowerCase().split(/\s+/).filter(Boolean);
    const memberRole = String(member.role ?? '').toLowerCase();
    const userRole = String(user.role ?? '').toLowerCase();
    if (tokens.some((token) => nameTokens.includes(token) || (roleMentions.has(token) && [memberRole, userRole].includes(token)))) {
      mentionedIds.add(user._id.toString());
    }
  }

  const mentions = await Promise.all(
    [...mentionedIds].map((mentionedUserId) =>
      MessageMentionModel.findOneAndUpdate(
        { messageId: input.messageId, mentionedUserId },
        { conversationId: input.conversationId, mentionedBy: input.mentionedBy },
        { upsert: true, new: true },
      ),
    ),
  );

  await Promise.all(
    mentions.map((mention) =>
      createNotification({
        receiverId: mention.mentionedUserId.toString(),
        senderId: input.mentionedBy,
        title: 'You were mentioned',
        message: 'A teammate mentioned you in a Hopt It conversation.',
        type: 'chat-mention',
        category: 'chat',
        priority: 'high',
        actionUrl: `/messages/${input.conversationId}`,
        metadata: { conversationId: input.conversationId, messageId: input.messageId },
      }),
    ),
  );

  mentions.forEach((mention) => {
    emitConversation(input.conversationId, CHAT_SOCKET_EVENTS.MENTION_CREATED, { mention });
  });

  return mentions;
}
