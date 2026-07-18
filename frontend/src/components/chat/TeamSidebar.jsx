export function TeamSidebar({ items = [], active, onSelect }) {
  return (
    <aside className="rounded-[2rem] border border-emerald-100 bg-white p-3 shadow-sm">
      {items.map((item) => (
        <button key={item.id} type="button" onClick={() => onSelect?.(item.id)} className={`block w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold ${active === item.id ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-emerald-50'}`}>
          {item.label}
        </button>
      ))}
    </aside>
  );
}
