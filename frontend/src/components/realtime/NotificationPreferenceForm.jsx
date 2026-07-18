import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/useRealtime.js';

const preferenceFields = [
  ['inApp', 'In-app alerts'],
  ['email', 'Email updates'],
  ['push', 'Push notifications'],
  ['taskNotifications', 'Task updates'],
  ['weatherAlerts', 'Weather alerts'],
  ['diseaseAlerts', 'Disease alerts'],
  ['agreementNotifications', 'Agreement updates'],
  ['adminMessages', 'Admin messages'],
];

export function NotificationPreferenceForm() {
  const { data } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();
  const [values, setValues] = useState({});

  useEffect(() => {
    if (data?.preferences) setValues(data.preferences);
  }, [data]);

  return (
    <form
      className="h-fit rounded-[28px] border border-emerald-100 bg-white p-4 shadow-xl shadow-emerald-900/5 sm:p-5 lg:sticky lg:top-28"
      onSubmit={(event) => {
        event.preventDefault();
        updatePreferences.mutate(values);
      }}
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Controls</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">Notification preferences</h2>
        <p className="mt-1 text-sm text-slate-500">Choose which updates should reach you while managing land, workers, agreements, and farms.</p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {preferenceFields.map(([key, label]) => (
          <label key={key} className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700">
            <span>{label}</span>
            <input className="h-4 w-4 accent-emerald-600" type="checkbox" checked={Boolean(values[key])} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.checked }))} />
          </label>
        ))}
      </div>
      <Button type="submit" className="mt-5 h-11 w-full rounded-2xl" disabled={updatePreferences.isPending}>
        Save preferences
      </Button>
    </form>
  );
}
