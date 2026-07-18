import { useEffect, useState } from 'react';
import { ImagePlus, MapPin, Paperclip, SendHorizonal } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { MentionAutocomplete } from '@/components/chat/MentionAutocomplete.jsx';
import { useSendMessage, useUploadChatAttachment } from '@/hooks/useChat.js';
import { useTypingSocket } from '@/hooks/useChatSocket.js';

export function MessageComposer({ conversationId, members = [], replyToMessage, onClearReply }) {
  const draftKey = `hoptit-chat-draft-${conversationId}`;
  const [text, setText] = useState(() => window.localStorage.getItem(draftKey) ?? '');
  const sendMessage = useSendMessage();
  const uploadAttachment = useUploadChatAttachment();
  const { emitTypingStart, emitTypingStop } = useTypingSocket(conversationId);

  useEffect(() => {
    window.localStorage.setItem(draftKey, text);
  }, [draftKey, text]);

  async function submit() {
    if (!text.trim() || sendMessage.isPending) return;
    const clientMessageId = crypto.randomUUID();
    await sendMessage.mutateAsync({ conversationId, payload: { type: 'text', text, replyToMessageId: replyToMessage?._id, clientMessageId } });
    setText('');
    window.localStorage.removeItem(draftKey);
    onClearReply?.();
    emitTypingStop();
  }

  async function upload(files) {
    if (!files?.length) return;
    const result = await uploadAttachment.mutateAsync({ conversationId, files: [...files] });
    await sendMessage.mutateAsync({ conversationId, payload: { type: result.attachments[0]?.type ?? 'document', attachmentIds: result.attachments.map((item) => item._id), clientMessageId: crypto.randomUUID() } });
  }

  async function shareApproxLocation() {
    await sendMessage.mutateAsync({ conversationId, payload: { type: 'location', location: { latitude: 12.9716, longitude: 77.5946, label: 'Shared farm point' }, clientMessageId: crypto.randomUUID() } });
  }

  const activeMention = text.match(/(^|\s)(@[\w-]*)$/)?.[2] ?? '';

  return (
    <div className="sticky bottom-0 border-t border-emerald-100 bg-white/90 p-3 backdrop-blur-xl">
      {replyToMessage && (
        <div className="mb-2 flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          <span className="line-clamp-1">Replying to: {replyToMessage.text || 'message'}</span>
          <button type="button" onClick={onClearReply} className="font-bold">Clear</button>
        </div>
      )}
      <div className="relative flex items-end gap-2 rounded-3xl border border-emerald-100 bg-white p-2 shadow-xl shadow-emerald-900/5">
        <MentionAutocomplete
          members={members}
          query={activeMention}
          onSelect={(member) => {
            const handle = `@${member.userId?.name?.split(' ')?.[0] ?? member.role} `;
            setText((current) => current.replace(/(^|\s)(@[\w-]*)$/, `$1${handle}`));
          }}
        />
        <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl text-slate-500 hover:bg-emerald-50 hover:text-emerald-700" aria-label="Attach file">
          <Paperclip className="h-5 w-5" />
          <input type="file" className="sr-only" multiple onChange={(event) => upload(event.target.files)} />
        </label>
        <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl text-slate-500 hover:bg-emerald-50 hover:text-emerald-700" aria-label="Attach image">
          <ImagePlus className="h-5 w-5" />
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" multiple onChange={(event) => upload(event.target.files)} />
        </label>
        <button type="button" onClick={shareApproxLocation} className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 hover:bg-emerald-50 hover:text-emerald-700" aria-label="Share location">
          <MapPin className="h-5 w-5" />
        </button>
        <textarea
          value={text}
          onFocus={emitTypingStart}
          onChange={(event) => {
            setText(event.target.value);
            emitTypingStart();
          }}
          onBlur={emitTypingStop}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
          rows={1}
          maxLength={5000}
          placeholder="Message your Hopt It team"
          className="max-h-36 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
        />
        <Button type="button" size="icon" onClick={submit} disabled={!text.trim() || sendMessage.isPending} aria-label="Send message">
          <SendHorizonal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
