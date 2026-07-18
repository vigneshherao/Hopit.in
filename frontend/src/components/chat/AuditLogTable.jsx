import { chatTime } from '@/utils/chatData.js';

export function AuditLogTable({ logs = [] }) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-sm">
      <div className="border-b border-emerald-100 px-5 py-4 text-sm font-bold text-slate-950">Audit logs</div>
      <div className="divide-y divide-slate-100">{logs.length ? logs.map((log) => <div key={log._id} className="grid gap-1 px-5 py-3 text-sm sm:grid-cols-3"><span className="font-semibold text-slate-800">{log.action}</span><span className="text-slate-500">{log.entity}</span><span className="text-slate-400">{chatTime(log.createdAt)}</span></div>) : <p className="p-5 text-sm text-slate-500">No audit logs visible.</p>}</div>
    </section>
  );
}
