import { Plus, Search } from 'lucide-react';
import { ConversationListItem } from '@/components/chat/ConversationListItem.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { conversationFilters } from '@/utils/chatData.js';
import { cn } from '@/utils/cn.js';

export function ConversationSidebar({ conversations = [], activeId, search, onSearch, filter, onFilter, onSelect, onNew }) {
  return (
    <aside className="flex min-h-[calc(100svh-8rem)] w-full flex-col border-r border-emerald-100 bg-white/85 backdrop-blur-xl">
      <div className="border-b border-emerald-100 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Messages</p>
            <h1 className="text-2xl font-bold text-slate-950">Hopt It chat</h1>
          </div>
          <Button type="button" size="icon" onClick={onNew} aria-label="New conversation">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <label className="relative mt-4 block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search conversations" className="pl-9" />
        </label>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {conversationFilters.map((item) => (
            <button key={item.value} type="button" onClick={() => onFilter(item.value)} className={cn('shrink-0 rounded-2xl px-3 py-2 text-xs font-semibold transition', filter === item.value ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700')}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto p-3">
        {conversations.length ? conversations.map((conversation) => <ConversationListItem key={conversation._id} conversation={conversation} isActive={activeId === conversation._id} onClick={() => onSelect(conversation._id)} />) : <div className="rounded-3xl border border-dashed border-emerald-200 p-6 text-center text-sm text-slate-500">No conversations yet.</div>}
      </div>
    </aside>
  );
}
