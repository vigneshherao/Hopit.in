import { SendHorizonal } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';

export function ThreadReply({ messageId, onReply }) {
  const [text, setText] = useState('');
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!text.trim()) return;
        onReply({ messageId, text, clientMessageId: crypto.randomUUID() });
        setText('');
      }}
      className="mt-3 flex gap-2"
    >
      <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Reply in thread" className="min-w-0 flex-1 rounded-2xl border border-emerald-100 px-3 py-2 text-sm outline-none focus:border-emerald-400" />
      <Button type="submit" size="icon" aria-label="Send thread reply">
        <SendHorizonal className="h-4 w-4" />
      </Button>
    </form>
  );
}
