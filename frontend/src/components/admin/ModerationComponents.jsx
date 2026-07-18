import { Link } from 'react-router-dom';
import { BadgeCheck, FileText, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { AdminEmptyState, AdminPanel, AdminStatusBadge } from '@/components/admin/AdminPrimitives.jsx';
import { moderationChecklistLabels, moderationTimelineIcons } from '@/utils/moderationData.js';

export function ModerationCard({ item }) {
  const land = item.landId ?? {};
  return (
    <div className="rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg">
      <div className="flex flex-col gap-4 sm:flex-row">
        <img src={land.media?.images?.[0] ?? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'} alt={land.title ?? 'Land listing'} className="h-36 w-full rounded-2xl object-cover sm:w-52" loading="lazy" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <AdminStatusBadge value={item.status} />
            <AdminStatusBadge value={item.priority} />
            {item.flagsCount ? <AdminStatusBadge value={`${item.flagsCount} flags`} /> : null}
          </div>
          <h3 className="mt-3 text-lg font-black text-slate-950">{land.title ?? 'Untitled listing'}</h3>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{land.location?.district ?? 'Unknown district'}, {land.location?.state ?? 'Unknown state'}</span>
            <span>{land.area?.value} {land.area?.unit}</span>
            <span>{land.transactionTypes?.join(', ')}</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button asChild size="sm"><Link to={`/admin/moderation/${item._id}`}>Review</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to={`/lands/${land.slug ?? land._id}`}>Public details</Link></Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModerationTable({ items = [] }) {
  if (!items.length) return <AdminEmptyState title="No moderation records" description="Submitted marketplace listings will appear here." />;
  return (
    <div className="grid gap-3">
      {items.map((item) => <ModerationCard key={item._id} item={item} />)}
    </div>
  );
}

export function ChecklistPanel({ checklist = [] }) {
  return (
    <AdminPanel title="Checklist" description="Land verification checklist used by moderators before a decision.">
      <div className="grid gap-2 sm:grid-cols-2">
        {checklist.map((item) => (
          <div key={item.item} className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-3">
            <span className="text-sm font-semibold text-slate-700">{moderationChecklistLabels[item.item] ?? item.item}</span>
            <AdminStatusBadge value={item.result} />
          </div>
        ))}
      </div>
    </AdminPanel>
  );
}

export function DocumentViewer({ documents = [] }) {
  return (
    <AdminPanel title="Documents" description="Upload-ready document review data with OCR and scan status placeholders.">
      {documents.length ? documents.map((document) => (
        <div key={`${document.type}-${document.name}`} className="mb-3 rounded-2xl border border-emerald-100 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-purple-50 p-3 text-purple-700"><FileText className="h-4 w-4" /></span>
              <div><p className="font-bold text-slate-950">{document.name}</p><p className="text-xs text-slate-500">{document.type}</p></div>
            </div>
            <div className="flex flex-wrap gap-2"><AdminStatusBadge value={document.reviewStatus} /><AdminStatusBadge value={document.ocrStatus} /></div>
          </div>
          {document.ocrText ? <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">{document.ocrText}</p> : null}
        </div>
      )) : <AdminEmptyState title="No documents" description="This listing has no moderation document records yet." />}
    </AdminPanel>
  );
}

export function VersionHistory({ versions = [] }) {
  return (
    <AdminPanel title="Version history" description="Immutable snapshots with highlighted field-level changes.">
      {versions.length ? versions.map((version) => (
        <div key={version._id} className="mb-3 rounded-2xl border border-emerald-100 p-4">
          <div className="flex items-center justify-between gap-3"><p className="font-bold text-slate-950">Version {version.version}</p><span className="text-xs text-slate-500">{new Date(version.createdAt).toLocaleString()}</span></div>
          <p className="mt-1 text-sm text-slate-500">{version.reason}</p>
          {version.diff?.length ? <div className="mt-3 grid gap-2">{version.diff.map((diff) => <p key={diff.path} className="rounded-2xl bg-purple-50 p-3 text-xs text-purple-800">{diff.path}: changed</p>)}</div> : null}
        </div>
      )) : <AdminEmptyState title="No versions" description="A snapshot will be created when a listing enters moderation." />}
    </AdminPanel>
  );
}

export function AuditTimeline({ timeline = [], decisions = [] }) {
  return (
    <AdminPanel title="Timeline" description="Listing status timeline and moderation decisions.">
      <div className="space-y-3">
        {timeline.map((event, index) => {
          const Icon = moderationTimelineIcons[event.event] ?? BadgeCheck;
          return (
            <div key={`${event.event}-${index}`} className="flex gap-3">
              <span className="mt-1 rounded-full bg-emerald-50 p-2 text-emerald-700"><Icon className="h-4 w-4" /></span>
              <div><p className="font-semibold text-slate-950">{event.message}</p><p className="text-xs text-slate-500">{event.createdAt ? new Date(event.createdAt).toLocaleString() : event.event}</p></div>
            </div>
          );
        })}
        {decisions.map((decision) => (
          <div key={decision._id} className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
            <span className="font-bold">{decision.decision}</span>: {decision.reason}
          </div>
        ))}
      </div>
    </AdminPanel>
  );
}
