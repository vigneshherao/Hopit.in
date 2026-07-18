export function ReportedItemsTable({ reports = [] }) {
  return <div className="rounded-[2rem] border border-slate-100 bg-white p-5 text-sm text-slate-600">{reports.length} reported item{reports.length === 1 ? '' : 's'} currently visible.</div>;
}
