import { NotebookPen } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';

export function SharedNoteEditor({ notes = [], conversationId, onCreate }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  function submit(event) {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onCreate({ conversationId, title, content });
    setTitle('');
    setContent('');
  }

  return (
    <section className="rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
        <NotebookPen className="h-4 w-4 text-emerald-600" />
        Shared notes
      </div>
      <div className="mt-3 space-y-2">
        {notes.slice(0, 3).map((note) => (
          <article key={note._id} className="rounded-2xl bg-slate-50 px-3 py-2">
            <p className="text-xs font-bold text-slate-800">{note.title}</p>
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{note.content}</p>
          </article>
        ))}
      </div>
      <form onSubmit={submit} className="mt-3 space-y-2">
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Note title" className="w-full rounded-2xl border border-emerald-100 px-3 py-2 text-xs outline-none focus:border-emerald-400" />
        <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a shared farm note" rows={3} className="w-full resize-none rounded-2xl border border-emerald-100 px-3 py-2 text-xs outline-none focus:border-emerald-400" />
        <Button type="submit" size="sm" className="w-full">Save note</Button>
      </form>
    </section>
  );
}
