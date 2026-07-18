import { AtSign } from 'lucide-react';

export function MentionAutocomplete({ members = [], query = '', onSelect }) {
  if (!query.startsWith('@')) return null;
  const normalized = query.slice(1).toLowerCase();
  const options = members
    .filter((member) => {
      const name = member.userId?.name?.toLowerCase() ?? '';
      const role = member.role?.toLowerCase() ?? '';
      return name.includes(normalized) || role.includes(normalized);
    })
    .slice(0, 6);

  if (!options.length) return null;

  return (
    <div className="absolute bottom-full left-3 mb-2 w-72 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-2xl shadow-emerald-900/10">
      {options.map((member) => (
        <button key={member._id} type="button" onClick={() => onSelect(member)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-emerald-50">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">{member.userId?.name?.charAt(0) ?? <AtSign className="h-4 w-4" />}</span>
          <span>
            <span className="block text-sm font-semibold text-slate-900">{member.userId?.name ?? 'Member'}</span>
            <span className="block text-xs capitalize text-slate-500">{member.role}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
