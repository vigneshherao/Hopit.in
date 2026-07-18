import { Archive, Pin, Search, VolumeX } from 'lucide-react';
import { ConversationAvatar } from '@/components/chat/ConversationAvatar.jsx';
import { Button } from '@/components/ui/button.jsx';
import { conversationTitle } from '@/utils/chatData.js';

export function ConversationHeader({ conversation, typingUsers = [], onArchive, onMute, onPin }) {
  return (
    <header className="sticky top-0 z-10 flex min-h-20 items-center justify-between gap-3 border-b border-emerald-100 bg-white/90 px-4 py-3 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-3">
        <ConversationAvatar conversation={conversation} />
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-slate-950">{conversationTitle(conversation)}</h2>
          <p className="truncate text-xs text-slate-500">{typingUsers.length ? 'Someone is typing...' : `${conversation?.memberCount ?? 0} members · ${conversation?.type ?? 'chat'}`}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button type="button" variant="ghost" size="icon" aria-label="Search messages">
          <Search className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={onPin} aria-label="Pin conversation">
          <Pin className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={onMute} aria-label="Mute conversation">
          <VolumeX className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={onArchive} aria-label="Archive conversation">
          <Archive className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
