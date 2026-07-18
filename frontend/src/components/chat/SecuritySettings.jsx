export function SecuritySettings() {
  return (
    <section className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-950">Security controls</p>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        <li>JWT and socket authentication enabled</li>
        <li>Conversation membership checks enforced</li>
        <li>Reports and moderation are audited</li>
        <li>Attachment scanning hook is provider-ready</li>
      </ul>
    </section>
  );
}
