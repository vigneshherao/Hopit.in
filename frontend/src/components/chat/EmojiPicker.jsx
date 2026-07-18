import { chatReactions } from '@/utils/chatCollaborationData.js';

export function EmojiPicker({ onSelect }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-2xl border border-emerald-100 bg-white p-2 shadow-xl shadow-emerald-900/10">
      {chatReactions.map((emoji) => (
        <button key={emoji} type="button" onClick={() => onSelect(emoji)} className="grid h-8 w-8 place-items-center rounded-xl text-lg hover:bg-emerald-50" aria-label={`React ${emoji}`}>
          {emoji}
        </button>
      ))}
    </div>
  );
}
