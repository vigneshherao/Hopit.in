import { Archive, ArrowLeft, LayoutDashboard, Pin, Search, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConversationAvatar } from '@/components/chat/ConversationAvatar.jsx';
import { Button } from '@/components/ui/button.jsx';
import { conversationTitle } from '@/utils/chatData.js';

export function ConversationHeader({ conversation, typingUsers = [], onArchive, onMute, onPin, onBack }) {
  return (
    <header className="sticky top-0 z-10 flex min-h-20 items-center justify-between gap-3 border-b border-emerald-100 bg-white/90 px-4 py-3 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-3">
        <Button type="button" variant="ghost" size="icon" onClick={onBack} aria-label="Back to conversations" className="shrink-0 lg:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <ConversationAvatar conversation={conversation} />
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-slate-950">{conversationTitle(conversation)}</h2>
          <p className="truncate text-xs text-slate-500">{typingUsers.length ? 'Someone is typing...' : `${conversation?.memberCount ?? 0} members · ${conversation?.type ?? 'chat'}`}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        {conversation?._id && (
          <Button asChild type="button" variant="ghost" size="icon" aria-label="Open team workspace">
            <Link to={`/messages/${conversation._id}/workspace`}>
              <LayoutDashboard className="h-4 w-4" />
            </Link>
          </Button>
        )}
        <Button type="button" variant="ghost" size="icon" aria-label="Search messages" className="hidden sm:inline-flex">
          <Search className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={onPin} aria-label="Pin conversation" className="hidden sm:inline-flex">
          <Pin className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={onMute} aria-label="Mute conversation" className="hidden min-[420px]:inline-flex">
          <VolumeX className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={onArchive} aria-label="Archive conversation">
          <Archive className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
