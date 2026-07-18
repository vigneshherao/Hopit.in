import { Pin, VolumeX } from 'lucide-react';
import { ConversationAvatar } from '@/components/chat/ConversationAvatar.jsx';
import { chatTime, conversationTitle } from '@/utils/chatData.js';
import { cn } from '@/utils/cn.js';

export function ConversationListItem({ conversation, isActive, onClick }) {
  const unread = conversation.member?.unreadCount ?? 0;
  return (
    <button type="button" onClick={onClick} className={cn('flex w-full items-center gap-3 rounded-3xl p-3 text-left transition hover:bg-emerald-50', isActive && 'bg-emerald-100/80')}>
      <ConversationAvatar conversation={conversation} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-slate-950">{conversationTitle(conversation)}</span>
          <span className="shrink-0 text-[11px] font-medium text-slate-400">{chatTime(conversation.lastMessageAt ?? conversation.createdAt)}</span>
        </span>
        <span className="mt-1 flex items-center gap-2">
          <span className="truncate text-xs text-slate-500">{conversation.lastMessagePreview || 'No messages yet'}</span>
          {conversation.member?.isMuted && <VolumeX className="h-3.5 w-3.5 text-slate-400" />}
          {conversation.member?.isPinned && <Pin className="h-3.5 w-3.5 text-emerald-600" />}
        </span>
      </span>
      {unread > 0 && <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-600 px-2 text-xs font-bold text-white">{unread}</span>}
    </button>
  );
}
