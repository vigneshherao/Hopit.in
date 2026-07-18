import { Button } from '@/components/ui/button.jsx';

export function ModerationQueue({ reports = [], onModerate }) {
  return (
    <section className="rounded-[2rem] border border-rose-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-950">Moderation queue</p>
      <div className="mt-4 space-y-3">
        {reports.length ? reports.map((report) => (
          <div key={report._id} className="rounded-3xl border border-rose-100 bg-rose-50/60 p-4">
            <p className="text-sm font-bold capitalize text-rose-950">{report.reason}</p>
            <p className="mt-1 text-xs text-rose-900/70">{report.entityType} · {report.status}</p>
            <div className="mt-3 flex gap-2"><Button size="sm" variant="outline" onClick={() => onModerate?.({ reportId: report._id, payload: { action: 'dismiss' } })}>Dismiss</Button><Button size="sm" onClick={() => onModerate?.({ reportId: report._id, payload: { action: 'resolve-report' } })}>Resolve</Button></div>
          </div>
        )) : <p className="text-sm text-slate-500">No open reports.</p>}
      </div>
    </section>
  );
}
