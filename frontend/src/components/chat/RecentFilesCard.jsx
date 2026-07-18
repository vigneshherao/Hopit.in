import { Paperclip } from 'lucide-react';

export function RecentFilesCard({ files = [] }) {
  return <ListCard icon={Paperclip} title="Recent files" items={files.map((file) => ({ id: file._id, title: file.originalFileName, meta: file.type }))} empty="No files shared yet." />;
}

function ListCard({ icon: Icon, title, items, empty }) {
  return (
    <section className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-950"><Icon className="h-4 w-4 text-emerald-600" />{title}</div>
      <div className="mt-4 space-y-2">{items.length ? items.map((item) => <div key={item.id} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm"><p className="font-semibold text-slate-800">{item.title}</p><p className="text-xs text-slate-500">{item.meta}</p></div>) : <p className="text-sm text-slate-500">{empty}</p>}</div>
    </section>
  );
}
