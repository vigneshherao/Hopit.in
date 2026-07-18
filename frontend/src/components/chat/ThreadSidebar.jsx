import { X } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { ThreadReply } from '@/components/chat/ThreadReply.jsx';
import { chatTime } from '@/utils/chatData.js';

export function ThreadSidebar({ thread, messageId, onClose, onReply }) {
  if (!messageId) return null;
  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-md border-l border-emerald-100 bg-white p-5 shadow-2xl shadow-emerald-900/10 sm:rounded-l-[2rem]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Thread</p>
          <h3 className="text-lg font-bold text-slate-950">Workspace discussion</h3>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close thread">
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="mt-5 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-slate-700">{thread?.root?.text || 'Original message'}</div>
      <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto">
        {(thread?.replies ?? []).map((reply) => (
          <div key={reply._id} className="rounded-3xl border border-slate-100 bg-white p-3 shadow-sm">
            <p className="text-sm text-slate-700">{reply.text}</p>
            <p className="mt-2 text-[11px] text-slate-400">{chatTime(reply.createdAt)}</p>
          </div>
        ))}
      </div>
      <ThreadReply messageId={messageId} onReply={onReply} />
    </aside>
  );
}
