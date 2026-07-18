import { CalendarDays, Files, MessageSquareText, Pin, ShieldCheck } from 'lucide-react';
import { ConversationAnalyticsCard } from '@/components/chat/ConversationAnalyticsCard.jsx';
import { RecentFilesCard } from '@/components/chat/RecentFilesCard.jsx';
import { RecentDiscussionCard } from '@/components/chat/RecentDiscussionCard.jsx';
import { TeamActivityCard } from '@/components/chat/TeamActivityCard.jsx';
import { UpcomingEventCard } from '@/components/chat/UpcomingEventCard.jsx';
import { UpcomingTaskCard } from '@/components/chat/UpcomingTaskCard.jsx';

export function WorkspaceDashboard({ workspace }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <main className="space-y-4">
        <section className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-900/5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Team Workspace</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">{workspace?.conversation?.title || 'Farm collaboration hub'}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Announcements, notes, files, tasks, calendar events, and activity signals for this Hopt It conversation.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric icon={MessageSquareText} label="Messages" value={workspace?.analytics?.messageCount ?? 0} />
            <Metric icon={Files} label="Files" value={workspace?.recentFiles?.length ?? 0} />
            <Metric icon={Pin} label="Pinned" value={workspace?.pinnedMessages?.length ?? 0} />
            <Metric icon={CalendarDays} label="Upcoming" value={(workspace?.upcomingTasks?.length ?? 0) + (workspace?.upcomingEvents?.length ?? 0)} />
          </div>
        </section>
        <ConversationAnalyticsCard analytics={workspace?.analytics} />
        <div className="grid gap-4 lg:grid-cols-2">
          <RecentDiscussionCard discussions={workspace?.recentDiscussions ?? []} />
          <RecentFilesCard files={workspace?.recentFiles ?? []} />
          <UpcomingTaskCard tasks={workspace?.upcomingTasks ?? []} />
          <UpcomingEventCard events={workspace?.upcomingEvents ?? []} />
        </div>
      </main>
      <aside className="space-y-4">
        <TeamActivityCard activities={workspace?.activities ?? []} />
        <div className="rounded-[2rem] border border-purple-100 bg-purple-50/70 p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-purple-950">
            <ShieldCheck className="h-4 w-4" />
            Security posture
          </div>
          <p className="mt-2 text-sm leading-6 text-purple-900/75">Membership checks, audit logs, report queue, protected attachments, and provider-agnostic push architecture are active.</p>
        </div>
      </aside>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4">
      <Icon className="h-5 w-5 text-emerald-700" />
      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
    </div>
  );
}
