export function ReconnectBanner({ status }) {
  if (status === 'online') return null;
  return <div className="rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-900">Reconnecting securely. New workspace changes will sync when the socket returns.</div>;
}
