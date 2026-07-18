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
      className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-xl shadow-emerald-900/5"
      onSubmit={(event) => {
        event.preventDefault();
        updatePreferences.mutate(values);
      }}
    >
      <h2 className="text-lg font-semibold text-slate-950">Notification preferences</h2>
      <div className="mt-4 space-y-3">
        {preferenceFields.map(([key, label]) => (
          <label key={key} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            {label}
            <input type="checkbox" checked={Boolean(values[key])} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.checked }))} />
          </label>
        ))}
      </div>
      <Button type="submit" className="mt-4 w-full" disabled={updatePreferences.isPending}>
        Save preferences
      </Button>
    </form>
  );
}
