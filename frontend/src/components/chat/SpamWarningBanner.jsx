import { ShieldAlert } from 'lucide-react';

export function SpamWarningBanner({ visible }) {
  if (!visible) return null;
  return <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900"><ShieldAlert className="h-4 w-4" />Potential spam pattern detected. Slow down and keep messages relevant.</div>;
}
