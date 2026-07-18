import { EmojiPicker } from '@/components/chat/EmojiPicker.jsx';

export function ReactionBar({ reactions = [], onReact, compact = false }) {
  const summary = reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1">
      {Object.entries(summary).map(([emoji, count]) => (
        <button key={emoji} type="button" onClick={() => onReact?.(emoji)} className="rounded-full border border-emerald-100 bg-white/90 px-2 py-0.5 text-xs font-semibold text-slate-700 shadow-sm">
          {emoji} {count}
        </button>
      ))}
      {!compact && <EmojiPicker onSelect={onReact} />}
    </div>
  );
}
