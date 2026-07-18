import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { AlertTriangle, BadgeCheck, Send, ShieldAlert, UserCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { AdminErrorState, AdminLoadingState, AdminMetricCard, AdminPanel, AdminStatusBadge } from '@/components/admin/AdminPrimitives.jsx';
import { AuditTimeline, ChecklistPanel, DocumentViewer, ModerationTable, VersionHistory } from '@/components/admin/ModerationComponents.jsx';
import { useApproveListing, useAssignModerator, useEscalateListing, useModeration, useModerationQueue, useRejectListing, useRequestRevision } from '@/hooks/useModeration.js';
import { moderationQueueTabs } from '@/utils/moderationData.js';

function Header({ title, description }) {
  return (
    <div className="mb-5">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Marketplace moderation</p>
      <h1 className="mt-2 text-3xl font-black text-slate-950">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function ModerationQueuePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const filters = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const { data, isLoading, isError } = useModerationQueue(filters);

  function setQueue(value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('queue', value);
    else next.delete('queue');
    setSearchParams(next);
  }

  function submit(event) {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (q.trim()) next.set('q', q.trim());
    else next.delete('q');
    setSearchParams(next);
  }

  return (
    <div>
      <Header title="Moderation queue" description="Review land listings before and after publishing with assignment, checklist, document review, revisions, escalation and audit history." />
      <div className="mb-5 grid gap-4 md:grid-cols-4">
        <AdminMetricCard label="Queue items" value={data?.queue?.length ?? 0} icon={BadgeCheck} />
        <AdminMetricCard label="Pending tab" value={filters.queue || 'all'} icon={Send} />
        <AdminMetricCard label="Priority sort" value={filters.sort || 'newest'} icon={ShieldAlert} />
        <AdminMetricCard label="Audit" value="On" icon={AlertTriangle} />
      </div>
      <AdminPanel
        title="Queue"
        description="Filters persist in the URL so moderators can share review views."
        action={
          <form onSubmit={submit} className="flex w-full gap-2 sm:w-auto">
            <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search listing, district, owner" className="min-w-0 sm:w-72" />
            <Button type="submit">Search</Button>
          </form>
        }
      >
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {moderationQueueTabs.map((tab) => (
            <Button key={tab.label} variant={filters.queue === tab.value || (!filters.queue && !tab.value) ? 'default' : 'outline'} size="sm" onClick={() => setQueue(tab.value)}>
              {tab.label}
            </Button>
          ))}
        </div>
        {isLoading ? <AdminLoadingState label="Loading moderation queue" /> : null}
        {isError ? <AdminErrorState message="Moderation queue could not be loaded." /> : null}
        {!isLoading && !isError ? <ModerationTable items={data?.queue ?? []} /> : null}
      </AdminPanel>
    </div>
  );
}

export function ModerationDetailPage() {
  const { moderationId } = useParams();
  const { data, isLoading, isError } = useModeration(moderationId);
  const assign = useAssignModerator();
  const approve = useApproveListing();
  const reject = useRejectListing();
  const revision = useRequestRevision();
  const escalate = useEscalateListing();
  const moderation = data?.moderation;
  const land = moderation?.landId ?? {};
  const busy = assign.isPending || approve.isPending || reject.isPending || revision.isPending || escalate.isPending;
  const basePayload = { moderationId, reason: 'Moderation action from admin review console.', notes: 'Reviewed from Hopt It admin moderation workspace.' };

  return (
    <div>
      <Header title={land.title ?? 'Listing review'} description="Inspect listing details, media, checklist, documents, owner context, version history, decisions and timeline." />
      {isLoading ? <AdminLoadingState label="Loading moderation record" /> : null}
      {isError ? <AdminErrorState message="Moderation record could not be loaded." /> : null}
      {moderation ? (
        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <AdminPanel title={land.title ?? 'Land listing'} description={`${land.location?.district ?? 'Unknown district'}, ${land.location?.state ?? 'Unknown state'}`}>
            <img src={land.media?.images?.[0] ?? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'} alt={land.title ?? 'Land'} className="mb-5 aspect-[16/9] w-full rounded-3xl object-cover" />
            <div className="mb-5 flex flex-wrap gap-2">
              <AdminStatusBadge value={moderation.status} />
              <AdminStatusBadge value={moderation.priority} />
              <AdminStatusBadge value={land.status} />
            </div>
            <p className="text-sm leading-6 text-slate-600">{land.description}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <AdminMetricCard label="Area" value={`${land.area?.value ?? '-'} ${land.area?.unit ?? ''}`} />
              <AdminMetricCard label="Water" value={land.landDetails?.waterAvailability ?? 'unknown'} />
              <AdminMetricCard label="Views" value={land.viewCount ?? 0} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button disabled={busy} onClick={() => assign.mutate({ moderationId, method: 'self', reason: 'Self assigned from review panel.' })}><UserCheck className="h-4 w-4" />Self assign</Button>
              <Button disabled={busy} onClick={() => approve.mutate(basePayload)}><BadgeCheck className="h-4 w-4" />Approve</Button>
              <Button disabled={busy} variant="outline" onClick={() => revision.mutate({ ...basePayload, reason: 'Please update the missing or unclear listing information.' })}><Send className="h-4 w-4" />Revision</Button>
              <Button disabled={busy} variant="destructive" onClick={() => reject.mutate({ ...basePayload, reason: 'Listing does not meet marketplace publishing requirements.' })}><XCircle className="h-4 w-4" />Reject</Button>
              <Button disabled={busy} variant="outline" onClick={() => escalate.mutate({ ...basePayload, escalationLevel: 'senior-moderator' })}><ShieldAlert className="h-4 w-4" />Escalate</Button>
            </div>
          </AdminPanel>
          <ChecklistPanel checklist={moderation.checklist} />
          <DocumentViewer documents={moderation.documentReviews} />
          <AuditTimeline timeline={moderation.timeline} decisions={data.decisions} />
          <VersionHistory versions={data.versions} />
        </div>
      ) : null}
    </div>
  );
}
