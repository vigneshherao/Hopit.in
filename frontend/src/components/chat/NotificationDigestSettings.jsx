import { Button } from '@/components/ui/button.jsx';

export function NotificationDigestSettings({ settings, onSave }) {
  return (
    <section className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-950">Notification digest</p>
      <p className="mt-2 text-sm text-slate-500">Current frequency: {settings?.frequency ?? 'instant'}</p>
      <div className="mt-4 flex flex-wrap gap-2">{['instant', 'hourly', 'daily', 'weekly'].map((frequency) => <Button key={frequency} size="sm" variant={settings?.frequency === frequency ? 'default' : 'outline'} onClick={() => onSave?.({ frequency, channels: settings?.channels ?? ['in-app'] })}>{frequency}</Button>)}</div>
    </section>
  );
}
