import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn.js';

const ToastContext = createContext(null);

const toastTone = {
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-100 bg-white text-slate-950 shadow-emerald-900/10',
    iconClassName: 'bg-emerald-50 text-emerald-600',
  },
  error: {
    icon: AlertTriangle,
    className: 'border-rose-100 bg-white text-slate-950 shadow-rose-900/10',
    iconClassName: 'bg-rose-50 text-rose-600',
  },
  info: {
    icon: Info,
    className: 'border-sky-100 bg-white text-slate-950 shadow-sky-900/10',
    iconClassName: 'bg-sky-50 text-sky-600',
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((toast) => {
    const id = crypto.randomUUID?.() ?? String(Date.now());
    const nextToast = { id, tone: 'info', ...toast };
    setToasts((items) => [nextToast, ...items].slice(0, 4));
    window.setTimeout(() => dismiss(id), toast.duration ?? 4200);
    return id;
  }, [dismiss]);

  const value = useMemo(() => ({ showToast, dismiss }), [dismiss, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-24 z-[1000] grid w-[calc(100vw-2rem)] max-w-sm gap-3 sm:right-6" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => {
          const tone = toastTone[toast.tone] ?? toastTone.info;
          const Icon = tone.icon;
          return (
            <div key={toast.id} className={cn('flex items-start gap-3 rounded-3xl border p-4 shadow-2xl backdrop-blur-xl', tone.className)}>
              <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', tone.iconClassName)}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{toast.title}</p>
                {toast.message ? <p className="mt-1 text-sm leading-5 text-slate-500">{toast.message}</p> : null}
              </div>
              <button type="button" className="rounded-xl p-1 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700" onClick={() => dismiss(toast.id)} aria-label="Close notification">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider.');
  return context;
}
