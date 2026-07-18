import { ChevronLeft, ChevronRight, Search as SearchIcon } from 'lucide-react';
import { cn } from '@/utils/cn.js';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';

export function SearchBox({ className, inputClassName, ...props }) {
  return (
    <label className={cn('relative block', className)}>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input className={cn('pl-9', inputClassName)} {...props} />
    </label>
  );
}

export function Tabs({ items = [], value, onChange, className }) {
  return (
    <div className={cn('inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm', className)} role="tablist">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={value === item.value}
          onClick={() => onChange?.(item.value)}
          className={cn(
            'rounded-xl px-3 py-2 text-sm font-bold transition',
            value === item.value ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function Pagination({ page = 1, totalPages = 1, onPageChange, className }) {
  return (
    <nav className={cn('flex items-center justify-center gap-2', className)} aria-label="Pagination">
      <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700">
        {page} / {totalPages}
      </span>
      <Button type="button" variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)}>
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

export function Accordion({ items = [], openValue, onOpenChange, className }) {
  return (
    <div className={cn('grid gap-2', className)}>
      {items.map((item) => {
        const isOpen = openValue === item.value;
        return (
          <div key={item.value} className="rounded-2xl border border-slate-200 bg-white">
            <button type="button" className="flex w-full items-center justify-between gap-3 p-4 text-left font-bold text-slate-950" onClick={() => onOpenChange?.(isOpen ? null : item.value)}>
              {item.label}
              <ChevronRight className={cn('h-4 w-4 transition', isOpen && 'rotate-90')} />
            </button>
            {isOpen ? <div className="border-t border-slate-100 p-4 text-sm leading-6 text-slate-600">{item.children}</div> : null}
          </div>
        );
      })}
    </div>
  );
}
