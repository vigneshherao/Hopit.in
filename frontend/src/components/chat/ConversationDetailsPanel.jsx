import { UsersRound } from 'lucide-react';
import { AnnouncementCard } from '@/components/chat/AnnouncementCard.jsx';
import { PinnedSection } from '@/components/chat/PinnedSection.jsx';
import { SharedNoteEditor } from '@/components/chat/SharedNoteEditor.jsx';
import { StarredMessages } from '@/components/chat/StarredMessages.jsx';

export function ConversationDetailsPanel({ conversation, members = [], pins = [], stars = [], notes = [], announcements = [], onCreateNote, onOpenPinned }) {
  return (
    <aside className="hidden w-80 space-y-4 overflow-y-auto border-l border-emerald-100 bg-white/80 p-5 xl:block">
      <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Details</p>
        <h3 className="mt-2 text-lg font-bold text-slate-950">{conversation?.type ?? 'Conversation'}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{conversation?.description || 'Shared operational context for this Hopt It conversation.'}</p>
      </div>
      <PinnedSection pins={pins} onOpen={onOpenPinned} />
      <StarredMessages stars={stars} />
      <SharedNoteEditor notes={notes} conversationId={conversation?._id} onCreate={onCreateNote} />
      {announcements.length > 0 && (
        <section className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4">
          <p className="text-sm font-bold text-slate-950">Announcements</p>
          <div className="mt-3 space-y-2">
            {announcements.slice(0, 3).map((announcement) => <AnnouncementCard key={announcement._id} announcement={announcement} />)}
          </div>
        </section>
      )}
      <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
          <UsersRound className="h-4 w-4 text-emerald-600" />
          Members
        </div>
        <div className="mt-4 space-y-3">
          {members.map((member) => (
            <div key={member._id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm">
              <span className="font-medium text-slate-700">{member.userId?.name ?? 'Member'}</span>
              <span className="text-xs capitalize text-slate-400">{member.role}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
