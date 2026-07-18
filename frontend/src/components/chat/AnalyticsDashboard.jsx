import { ConversationAnalyticsCard } from '@/components/chat/ConversationAnalyticsCard.jsx';

export function AnalyticsDashboard({ dashboard }) {
  return (
    <section className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-950">Workspace analytics</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Unread" value={dashboard?.widgets?.unreadMessages ?? 0} />
        <Metric label="Active rooms" value={dashboard?.widgets?.activeConversationCount ?? 0} />
        <Metric label="Top reaction" value={dashboard?.widgets?.mostUsedReaction ?? '-'} />
        <Metric label="Top team" value={dashboard?.widgets?.topConversation?.conversationId?.title ?? '-'} />
      </div>
      <div className="mt-4"><ConversationAnalyticsCard analytics={dashboard?.widgets?.topConversation} /></div>
    </section>
  );
}

function Metric({ label, value }) {
  return <div className="rounded-3xl bg-emerald-50 p-4"><p className="text-2xl font-bold text-slate-950">{value}</p><p className="text-xs font-semibold text-slate-500">{label}</p></div>;
}
