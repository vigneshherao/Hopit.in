import { useParams } from 'react-router-dom';
import { AnalyticsDashboard } from '@/components/chat/AnalyticsDashboard.jsx';
import { AuditLogTable } from '@/components/chat/AuditLogTable.jsx';
import { ModerationQueue } from '@/components/chat/ModerationQueue.jsx';
import { NotificationDigestSettings } from '@/components/chat/NotificationDigestSettings.jsx';
import { OfflineBanner } from '@/components/chat/OfflineBanner.jsx';
import { ReconnectBanner } from '@/components/chat/ReconnectBanner.jsx';
import { SecuritySettings } from '@/components/chat/SecuritySettings.jsx';
import { SpamWarningBanner } from '@/components/chat/SpamWarningBanner.jsx';
import { WorkspaceDashboard } from '@/components/chat/WorkspaceDashboard.jsx';
import { useAnalyticsDashboard, useAuditLogs, useModeration, useNotificationDigest, useReports, useTeamWorkspace, useUpdateNotificationDigest } from '@/hooks/useChatEnterprise.js';
import { useSocket } from '@/hooks/useSocket.js';
import { useAuth } from '@/context/AuthContext.jsx';

export function TeamWorkspacePage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { status } = useSocket();
  const workspace = useTeamWorkspace(conversationId);
  const analytics = useAnalyticsDashboard();
  const reports = useReports({ status: 'open' });
  const moderation = useModeration();
  const digest = useNotificationDigest();
  const updateDigest = useUpdateNotificationDigest();
  const auditLogs = useAuditLogs({ limit: 20 });

  if (workspace.isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-10"><div className="h-96 animate-pulse rounded-[2rem] bg-emerald-50" /></div>;
  }

  return (
    <section className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
      <ReconnectBanner status={status} />
      <OfflineBanner />
      <SpamWarningBanner visible={false} />
      <WorkspaceDashboard workspace={workspace.data} />
      <AnalyticsDashboard dashboard={analytics.data} />
      <div className="grid gap-5 lg:grid-cols-2">
        {user?.role === 'admin' && <ModerationQueue reports={reports.data?.reports ?? []} onModerate={(payload) => moderation.mutate(payload)} />}
        {user?.role === 'admin' && <AuditLogTable logs={auditLogs.data?.logs ?? []} />}
        <NotificationDigestSettings settings={digest.data?.settings} onSave={(payload) => updateDigest.mutate(payload)} />
        <SecuritySettings />
      </div>
    </section>
  );
}
