import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn.js';
import { Badge } from '@/components/ui/badge.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';

export function Avatar({ src, name = 'User', className }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return src ? (
    <img src={src} alt={name} className={cn('h-10 w-10 rounded-full object-cover ring-2 ring-white', className)} loading="lazy" />
  ) : (
    <span className={cn('flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700 ring-2 ring-white', className)}>
      {initials || 'HI'}
    </span>
  );
}

export function Chip({ icon: Icon, children, className }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm', className)}>
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </span>
  );
}

export function Tag({ children, className }) {
  return <Badge variant="secondary" className={cn('bg-emerald-50 text-emerald-700', className)}>{children}</Badge>;
}

export function StatCard({ icon: Icon, label, value, trend, className }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
          </div>
          {Icon ? (
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Icon className="h-5 w-5" />
            </span>
          ) : null}
        </div>
        {trend ? <p className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-700"><ArrowUpRight className="h-4 w-4" />{trend}</p> : null}
      </CardContent>
    </Card>
  );
}

export function MetricCard({ title, value, helper, children, className }) {
  return (
    <div className={cn('rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.06)]', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
          {helper ? <p className="mt-1 text-sm text-slate-500">{helper}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}

export function Timeline({ items = [], className }) {
  return (
    <ol className={cn('relative space-y-4 border-l border-emerald-100 pl-5', className)}>
      {items.map((item) => (
        <li key={item.title} className="relative">
          <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow" />
          <p className="font-bold text-slate-950">{item.title}</p>
          {item.description ? <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p> : null}
          {item.meta ? <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">{item.meta}</p> : null}
        </li>
      ))}
    </ol>
  );
}

export function DataTable({ columns = [], rows = [], className }) {
  return (
    <div className={cn('overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead className="sticky top-0 bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
            <tr>{columns.map((column) => <th key={column.key} className="whitespace-nowrap px-4 py-3">{column.label}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id ?? row._id} className="hover:bg-emerald-50/40">
                {columns.map((column) => <td key={column.key} className="px-4 py-3 text-slate-700">{column.render ? column.render(row) : row[column.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
