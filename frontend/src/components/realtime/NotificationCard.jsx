import { Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { formatRelativeDate, notificationTypeIcons, priorityTone } from '@/utils/realtimeData.js';
import { cn } from '@/utils/cn.js';

export function NotificationCard({ notification, onRead, onDelete, compact = false }) {
  const Icon = notificationTypeIcons[notification.type] ?? notificationTypeIcons.general;

  return (
    <article className={cn('rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md', notification.isRead ? 'border-slate-100' : 'border-emerald-200 shadow-emerald-100/70')}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-slate-950">{notification.title}</h3>
            <Badge variant="outline" className={cn('capitalize', priorityTone(notification.priority))}>
              {notification.priority}
            </Badge>
          </div>
          <p className={cn('mt-1 text-sm leading-6 text-slate-600', compact && 'line-clamp-2')}>{notification.message}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400">{formatRelativeDate(notification.createdAt)}</span>
            <div className="flex items-center gap-1">
              {!notification.isRead && (
                <Button type="button" variant="ghost" size="sm" onClick={() => onRead?.(notification._id ?? notification.id)}>
                  <Check className="h-4 w-4" />
                  Read
                </Button>
              )}
              <Button type="button" variant="ghost" size="sm" onClick={() => onDelete?.(notification._id ?? notification.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
