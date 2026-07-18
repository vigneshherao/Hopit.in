import { conversationTypeIcons } from '@/utils/chatData.js';

export function ConversationAvatar({ conversation }) {
  const Icon = conversationTypeIcons[conversation?.type] ?? conversationTypeIcons.direct;
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
      {conversation?.avatarUrl ? <img src={conversation.avatarUrl} alt="" className="h-full w-full rounded-2xl object-cover" /> : <Icon className="h-5 w-5" />}
    </span>
  );
}
