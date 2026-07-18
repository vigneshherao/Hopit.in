import { Copy, GitBranch, MapPin, MoreHorizontal, Paperclip, Pin, Reply, Star, Trash2 } from 'lucide-react';
import { MessageStatusIcon } from '@/components/chat/MessageStatusIcon.jsx';
import { ReactionBar } from '@/components/chat/ReactionBar.jsx';
import { chatTime } from '@/utils/chatData.js';
import { cn } from '@/utils/cn.js';

export function MessageBubble({ message, isOwn, onReact, onPin, onStar, onThread, onDelete, onReply }) {
  if (message.type === 'system') {
    return <div className="mx-auto max-w-lg rounded-full bg-slate-100 px-4 py-2 text-center text-xs font-semibold text-slate-500">{message.text || 'System update'}</div>;
  }

  return (
    <article className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[82%] rounded-3xl px-4 py-3 shadow-sm', isOwn ? 'rounded-br-md bg-emerald-600 text-white' : 'rounded-bl-md border border-emerald-100 bg-white text-slate-800')}>
        {message.replyToMessageId && <div className={cn('mb-2 rounded-2xl px-3 py-2 text-xs', isOwn ? 'bg-white/15 text-emerald-50' : 'bg-emerald-50 text-emerald-700')}>Replying to a previous message</div>}
        {message.isDeletedForEveryone ? (
          <p className="text-sm italic opacity-70">This message was deleted</p>
        ) : (
          <>
            {message.forwardedFromMessageId && <p className="mb-1 text-xs font-semibold opacity-70">Forwarded</p>}
            {message.text && <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.text}</p>}
            {message.attachments?.length > 0 && (
              <div className="mt-2 grid gap-2">
                {message.attachments.map((attachment) => (
                  <a key={attachment._id} href={attachment.fileUrl} target="_blank" rel="noreferrer" className={cn('flex items-center gap-2 rounded-2xl px-3 py-2 text-sm', isOwn ? 'bg-white/15' : 'bg-slate-50')}>
                    <Paperclip className="h-4 w-4" />
                    {attachment.originalFileName}
                  </a>
                ))}
              </div>
            )}
            {message.locationId && (
              <a href={`https://maps.google.com/?q=${message.locationId.latitude},${message.locationId.longitude}`} target="_blank" rel="noreferrer" className={cn('mt-2 flex items-center gap-2 rounded-2xl px-3 py-2 text-sm', isOwn ? 'bg-white/15' : 'bg-emerald-50 text-emerald-700')}>
                <MapPin className="h-4 w-4" />
                {message.locationId.label || 'Shared location'}
              </a>
            )}
          </>
        )}
        <div className={cn('mt-2 flex items-center justify-end gap-1 text-[11px]', isOwn ? 'text-emerald-50/80' : 'text-slate-400')}>
          {message.threadReplyCount > 0 && (
            <button type="button" onClick={() => onThread?.(message)} className="mr-auto flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold hover:bg-black/5">
              <GitBranch className="h-3 w-3" />
              {message.threadReplyCount}
            </button>
          )}
          {message.editedAt && <span>edited</span>}
          <span>{chatTime(message.createdAt)}</span>
          {isOwn && <MessageStatusIcon status={message.status} />}
        </div>
        {!message.isDeletedForEveryone && (
          <div className={cn('mt-2 flex flex-wrap items-center gap-1 border-t pt-2', isOwn ? 'border-white/15' : 'border-slate-100')}>
            <ReactionBar reactions={message.reactions} onReact={(emoji) => onReact?.(message, emoji)} compact />
            <button type="button" onClick={() => onReact?.(message, '🌱')} className={cn('grid h-7 w-7 place-items-center rounded-full', isOwn ? 'hover:bg-white/15' : 'hover:bg-emerald-50')} aria-label="React">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => onReply?.(message)} className={cn('grid h-7 w-7 place-items-center rounded-full', isOwn ? 'hover:bg-white/15' : 'hover:bg-emerald-50')} aria-label="Reply">
              <Reply className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => onThread?.(message)} className={cn('grid h-7 w-7 place-items-center rounded-full', isOwn ? 'hover:bg-white/15' : 'hover:bg-emerald-50')} aria-label="Open thread">
              <GitBranch className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => onPin?.(message)} className={cn('grid h-7 w-7 place-items-center rounded-full', isOwn ? 'hover:bg-white/15' : 'hover:bg-emerald-50')} aria-label="Pin">
              <Pin className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => onStar?.(message)} className={cn('grid h-7 w-7 place-items-center rounded-full', isOwn ? 'hover:bg-white/15' : 'hover:bg-emerald-50')} aria-label="Star">
              <Star className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => navigator.clipboard?.writeText(message.text ?? '')} className={cn('grid h-7 w-7 place-items-center rounded-full', isOwn ? 'hover:bg-white/15' : 'hover:bg-emerald-50')} aria-label="Copy">
              <Copy className="h-3.5 w-3.5" />
            </button>
            {isOwn && (
              <button type="button" onClick={() => onDelete?.(message)} className="grid h-7 w-7 place-items-center rounded-full text-rose-200 hover:bg-white/15" aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
