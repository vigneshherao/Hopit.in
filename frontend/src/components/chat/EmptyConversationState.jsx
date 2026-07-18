import { MessageCircle } from 'lucide-react';

export function EmptyConversationState() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-1 items-center justify-center p-6">
      <div className="max-w-md text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700">
          <MessageCircle className="h-7 w-7" />
        </span>
        <h2 className="mt-5 text-2xl font-bold text-slate-950">Open a conversation</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Coordinate land deals, tasks, farm teams, agreements and support without leaving Hopt It.</p>
      </div>
    </div>
  );
}
