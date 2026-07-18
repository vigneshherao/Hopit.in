export function UnreadBadge({ count = 0 }) {
  if (!count) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white shadow-lg shadow-rose-500/30">
      {count > 99 ? '99+' : count}
    </span>
  );
}
