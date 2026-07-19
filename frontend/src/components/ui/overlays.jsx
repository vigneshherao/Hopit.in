import { X } from 'lucide-react';
import { cn } from '@/utils/cn.js';
import { Button } from '@/components/ui/button.jsx';

export function Dialog({ open, title, description, children, onClose, className }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto bg-slate-950/35 p-2 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className={cn('max-h-[calc(100dvh-1rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/80 bg-white p-4 shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl sm:p-5', className)}>
        <div className="flex items-start justify-between gap-4">
          <div>
            {title ? <h2 className="text-xl font-black text-slate-950">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export function Drawer({ open, title, children, onClose, side = 'right', className }) {
  if (!open) return null;
  const placement = side === 'left' ? 'left-0' : 'right-0';

  return (
    <div className="fixed inset-0 z-[75] bg-slate-950/30 backdrop-blur-sm">
      <aside className={cn('absolute top-0 h-full w-full overflow-y-auto bg-white p-4 shadow-2xl min-[380px]:w-[min(92vw,420px)] sm:p-5', placement, className)}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-slate-950">{title}</h2>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close drawer">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </aside>
    </div>
  );
}

export function Popover({ open, anchor, children, className }) {
  return (
    <div className="relative inline-flex">
      {anchor}
      {open ? <div className={cn('absolute right-0 top-full z-50 mt-2 w-[min(16rem,calc(100vw-1rem))] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl', className)}>{children}</div> : null}
    </div>
  );
}

export function Tooltip({ label, children }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white shadow-lg group-hover:block">
        {label}
      </span>
    </span>
  );
}

export function Dropdown({ trigger, items = [], className }) {
  return (
    <details className="relative inline-flex">
      <summary className="list-none">{trigger}</summary>
      <div className={cn('absolute right-0 top-full z-50 mt-2 w-[min(13rem,calc(100vw-1rem))] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl', className)}>
        {items.map((item) => (
          <button key={item.label} type="button" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-emerald-50 hover:text-slate-950" onClick={item.onClick}>
            {item.icon ? <item.icon className="h-4 w-4" /> : null}
            {item.label}
          </button>
        ))}
      </div>
    </details>
  );
}
