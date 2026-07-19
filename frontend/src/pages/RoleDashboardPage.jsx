import {
  Activity,
  ArrowRight,
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarCheck,
  FileText,
  LandPlot,
  LogOut,
  MessageCircle,
  Plus,
  ShieldCheck,
  Sparkles,
  Sprout,
  UserRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { CardGridSkeleton, CardSkeleton } from '@/components/ui/feedback.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useActivities, useNotifications, useUnreadNotifications } from '@/hooks/useRealtime.js';
import { formatRelativeDate, notificationTypeIcons, priorityTone } from '@/utils/realtimeData.js';

const dashboardContent = {
  owner: {
    eyebrow: 'Owner command center',
    title: 'Turn every acre into an opportunity.',
    description: 'Publish trusted listings, review proposals, organize farm work, and keep every agreement moving.',
    actions: [
      { label: 'List new land', description: 'Create a verified marketplace listing', href: '/lands/new', icon: Plus },
      { label: 'My properties', description: 'Track listings and applications', href: '/my-lands', icon: LandPlot },
      { label: 'Hire workforce', description: 'Find skilled workers and managers', href: '/workers', icon: BriefcaseBusiness },
      { label: 'Plan a farm', description: 'Build an AI-assisted execution plan', href: '/farm-planner', icon: Sprout },
    ],
  },
  farmer: {
    eyebrow: 'Farmer workspace',
    title: 'Find land. Plan smarter. Grow with confidence.',
    description: 'Discover suitable land, manage proposals, use farm intelligence, and coordinate the people behind the work.',
    actions: [
      { label: 'Explore land', description: 'Search verified opportunities', href: '/lands', icon: LandPlot },
      { label: 'Applications', description: 'Follow proposals and agreements', href: '/my-applications', icon: FileText },
      { label: 'AI analyzer', description: 'Evaluate land and crop potential', href: '/ai-analyzer', icon: Bot },
      { label: 'Find workers', description: 'Build your field team', href: '/workers', icon: BriefcaseBusiness },
    ],
  },
  worker: {
    eyebrow: 'Worker opportunity hub',
    title: 'Build a trusted profile and a stronger work history.',
    description: 'Find relevant farm jobs, manage bookings, showcase skills, and stay connected with farm teams.',
    actions: [
      { label: 'Worker dashboard', description: 'See bookings and profile readiness', href: '/worker/dashboard', icon: Activity },
      { label: 'Find farm jobs', description: 'Browse matching opportunities', href: '/farm-jobs', icon: BriefcaseBusiness },
      { label: 'My applications', description: 'Track job application progress', href: '/my-job-applications', icon: FileText },
      { label: 'Update profile', description: 'Improve skills and availability', href: '/worker/profile/edit', icon: UserRound },
    ],
  },
  admin: {
    eyebrow: 'Platform operations',
    title: 'Keep Hopt It trusted, responsive, and growing.',
    description: 'Review platform health, moderate marketplace activity, manage access, and act on risk signals.',
    actions: [
      { label: 'Admin console', description: 'Open the operations overview', href: '/admin', icon: ShieldCheck },
      { label: 'Moderation', description: 'Review marketplace submissions', href: '/admin/moderation', icon: LandPlot },
      { label: 'User directory', description: 'Manage accounts and access', href: '/admin/users', icon: UserRound },
      { label: 'Audit trail', description: 'Inspect sensitive admin actions', href: '/admin/audit-logs', icon: FileText },
    ],
  },
};

export function RoleDashboardPage({ role }) {
  const { user, logout } = useAuth();
  const notificationsQuery = useNotifications({ limit: 5 });
  const unreadQuery = useUnreadNotifications();
  const activitiesQuery = useActivities({ limit: 5 });
  const content = dashboardContent[role] ?? dashboardContent.farmer;
  const notifications = notificationsQuery.data?.notifications ?? [];
  const activities = activitiesQuery.data?.activities ?? [];
  const unreadCount = unreadQuery.data?.unreadCount ?? unreadQuery.data?.notifications?.length ?? 0;
  const loadingMetrics = notificationsQuery.isLoading || unreadQuery.isLoading || activitiesQuery.isLoading;

  return (
    <section className="page-shell space-y-6 sm:space-y-8">
      <div className="relative overflow-hidden rounded-[30px] border border-emerald-200/70 bg-[linear-gradient(125deg,#052e2b_0%,#065f46_50%,#15803d_100%)] p-5 text-white shadow-[0_28px_90px_rgba(6,95,70,0.24)] sm:rounded-[38px] sm:p-8 lg:p-10">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-lime-300/15 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <Badge className="border border-white/20 bg-white/10 text-white shadow-none backdrop-blur">{content.eyebrow}</Badge>
            <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">{content.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50/85 sm:text-base">Welcome back, {user?.name?.split(' ')[0] ?? 'there'}. {content.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-white text-emerald-900 shadow-xl hover:bg-emerald-50"><Link to="/messages"><MessageCircle className="h-4 w-4" />Messages</Link></Button>
            <Button variant="outline" onClick={logout} className="border-white/25 bg-white/10 text-white hover:bg-white/20"><LogOut className="h-4 w-4" />Logout</Button>
          </div>
        </div>
      </div>

      {loadingMetrics ? <CardGridSkeleton /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={Bell} label="Unread updates" value={unreadCount} helper="Notifications needing attention" tone="emerald" />
          <MetricCard icon={Activity} label="Recent activity" value={activities.length} helper="Latest workspace events" tone="blue" />
          <MetricCard icon={CalendarCheck} label="Workspace" value="Live" helper="Realtime services connected" tone="purple" />
          <MetricCard icon={Sparkles} label="AI tools" value="Ready" helper="Advisory intelligence available" tone="amber" />
        </div>
      )}

      <div>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Quick actions</p><h2 className="mt-1 text-2xl font-black text-slate-950">Move work forward</h2></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {content.actions.map((action, index) => <ActionCard key={action.href} action={action} index={index} />)}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        {activitiesQuery.isLoading ? <CardSkeleton lines={4} /> : <ActivityPanel activities={activities} />}
        {notificationsQuery.isLoading ? <CardSkeleton lines={4} /> : <NotificationPanel notifications={notifications} />}
      </div>
    </section>
  );
}

function MetricCard({ icon: Icon, label, value, helper, tone }) {
  const tones = { emerald: 'bg-emerald-50 text-emerald-700', blue: 'bg-blue-50 text-blue-700', purple: 'bg-purple-50 text-purple-700', amber: 'bg-amber-50 text-amber-700' };
  return <Card className="h-full overflow-hidden border-slate-100 bg-white"><CardContent className="flex min-h-40 h-full flex-col p-5 sm:p-6"><div className="flex items-center justify-between gap-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tones[tone]}`}><Icon className="h-5 w-5" /></span></div><p className="mt-4 text-3xl font-black leading-none text-slate-950">{value}</p><p className="mt-auto pt-4 text-xs leading-5 text-slate-500">{helper}</p></CardContent></Card>;
}

function ActionCard({ action, index }) {
  const tones = ['from-emerald-50 to-white text-emerald-700', 'from-blue-50 to-white text-blue-700', 'from-purple-50 to-white text-purple-700', 'from-amber-50 to-white text-amber-700'];
  const Icon = action.icon;
  return <Link to={action.href} className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_24px_65px_rgba(15,23,42,0.09)]"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tones[index % tones.length]}`}><Icon className="h-5 w-5" /></span><div className="mt-5 flex items-start justify-between gap-3"><div><h3 className="font-black text-slate-950">{action.label}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{action.description}</p></div><ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600" /></div></Link>;
}

function ActivityPanel({ activities }) {
  return <Card className="border-slate-100"><CardContent className="p-5 sm:p-6"><PanelHeader eyebrow="Timeline" title="Recent activity" href="/activity" /><div className="mt-5 space-y-3">{activities.map((item) => <div key={item._id} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-50" /><div><p className="text-sm font-bold text-slate-900">{item.title ?? item.action}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.description ?? 'Workspace activity recorded.'}</p><p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">{formatRelativeDate(item.createdAt)}</p></div></div>)}{!activities.length ? <EmptyPanel label="No recent activity yet." /> : null}</div></CardContent></Card>;
}

function NotificationPanel({ notifications }) {
  return <Card className="border-slate-100"><CardContent className="p-5 sm:p-6"><PanelHeader eyebrow="Inbox" title="Latest updates" href="/notifications" /><div className="mt-5 space-y-3">{notifications.map((item) => { const Icon = notificationTypeIcons[item.type] ?? Bell; return <div key={item._id} className="flex gap-3 rounded-2xl border border-slate-100 p-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${priorityTone(item.priority)}`}><Icon className="h-4 w-4" /></span><div><p className="text-sm font-bold text-slate-900">{item.title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.message}</p><p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">{formatRelativeDate(item.createdAt)}</p></div></div>; })}{!notifications.length ? <EmptyPanel label="You’re all caught up." /> : null}</div></CardContent></Card>;
}

function PanelHeader({ eyebrow, title, href }) {
  return <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{eyebrow}</p><h2 className="mt-1 text-xl font-black text-slate-950">{title}</h2></div><Button asChild variant="ghost" size="sm"><Link to={href}>View all<ArrowRight className="h-4 w-4" /></Link></Button></div>;
}

function EmptyPanel({ label }) {
  return <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-5 text-center text-sm text-slate-500">{label}</div>;
}
