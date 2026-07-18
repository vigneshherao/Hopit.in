import { Check, CheckCheck, Clock, TriangleAlert } from 'lucide-react';

export function MessageStatusIcon({ status }) {
  if (status === 'failed') return <TriangleAlert className="h-3.5 w-3.5 text-rose-500" />;
  if (status === 'read' || status === 'delivered') return <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />;
  if (status === 'sent') return <Check className="h-3.5 w-3.5 text-slate-400" />;
  return <Clock className="h-3.5 w-3.5 text-slate-400" />;
}
