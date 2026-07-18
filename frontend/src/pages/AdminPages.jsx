import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { BadgeCheck, Bell, ClipboardList, Eye, Filter, LockKeyhole, Search, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { AdminEmptyState, AdminErrorState, AdminLoadingState, AdminMetricCard, AdminPanel, AdminStatusBadge, getByPath } from '@/components/admin/AdminPrimitives.jsx';
import {
  useAdminAccounts,
  useAdminAuditLogs,
  useAdminMe,
  useAdminOverview,
  useAdminPermissions,
  useAdminRoles,
  useAdminSavedViews,
  useAdminUser,
  useAdminUsers,
  useAdminVerification,
  useAdminVerifications,
  useChangeAdminUserStatus,
  useUpdateAdminVerification,
} from '@/hooks/useAdmin.js';
import { adminDashboardWidgets, adminMetricCards, adminPermissionGroups, adminUserStatusActions, adminVerificationActions } from '@/utils/adminData.js';

function PageHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-5">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-black text-slate-950">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-500">{description}</p>
    </div>
  );
}

function TableShell({ children }) {
  return <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white">{children}</div>;
}

export function AdminDashboardPage() {
  const { data, isLoading, isError } = useAdminOverview();

  if (isLoading) return <AdminLoadingState label="Loading admin overview" />;
  if (isError) return <AdminErrorState message="Admin overview could not be loaded." />;

  return (
    <div>
      <PageHeader eyebrow="Command center" title="Admin overview" description="A live operational snapshot for users, land marketplace, agreements, verifications, workers, and security alerts." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminMetricCards.map((metric) => (
          <AdminMetricCard key={metric.key} label={metric.label} value={getByPath(data, metric.key)} icon={metric.key.includes('user') ? Users : BadgeCheck} />
        ))}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminDashboardWidgets.map((widget) => (
          <AdminMetricCard key={widget.path} label={widget.label} value={getByPath(data, widget.path)} icon={widget.icon} helper="Updated from backend counters" />
        ))}
      </div>
      <AdminPanel className="mt-5" title="Operations pulse" description="Quick links for the highest-frequency admin workflows.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['/admin/users', 'Review users'],
            ['/admin/verifications', 'Verify profiles'],
            ['/admin/audit-logs', 'Inspect audit logs'],
            ['/admin/roles', 'Manage roles'],
          ].map(([href, label]) => (
            <Button key={href} asChild variant="outline" className="justify-start">
              <Link to={href}>{label}</Link>
            </Button>
          ))}
        </div>
      </AdminPanel>
    </div>
  );
}

export function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const filters = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const { data, isLoading, isError } = useAdminUsers(filters);

  function submitSearch(event) {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (q.trim()) next.set('q', q.trim());
    else next.delete('q');
    setSearchParams(next);
  }

  return (
    <div>
      <PageHeader eyebrow="Identity" title="Users" description="Search, inspect, and manage platform user accounts with permission-aware privacy controls." />
      <AdminPanel
        title="User directory"
        description="Private email and phone are only returned when the backend grants the matching permission."
        action={
          <form onSubmit={submitSearch} className="flex w-full gap-2 sm:w-auto">
            <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search users" className="min-w-0 sm:w-72" />
            <Button type="submit" size="icon" aria-label="Search users">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        }
      >
        {isLoading ? <AdminLoadingState /> : null}
        {isError ? <AdminErrorState message="Users could not be loaded." /> : null}
        {!isLoading && !isError ? (
          data?.users?.length ? (
            <TableShell>
              <div className="grid min-w-[760px] grid-cols-[1.5fr_1fr_1fr_1fr_1fr] border-b border-emerald-100 bg-emerald-50/60 px-4 py-3 text-xs font-bold uppercase text-emerald-800">
                <span>User</span><span>Role</span><span>Status</span><span>Joined</span><span>Action</span>
              </div>
              {data.users.map((user) => (
                <div key={user.id} className="grid min-w-[760px] grid-cols-[1.5fr_1fr_1fr_1fr_1fr] items-center px-4 py-3 text-sm text-slate-700">
                  <div><p className="font-bold text-slate-950">{user.name}</p><p className="text-xs text-slate-500">{user.email ?? user.location?.city ?? user.id}</p></div>
                  <span>{user.role}</span>
                  <AdminStatusBadge value={user.isActive ? 'active' : 'inactive'} />
                  <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span>
                  <Button asChild variant="outline" size="sm"><Link to={`/admin/users/${user.id}`}>Open</Link></Button>
                </div>
              ))}
            </TableShell>
          ) : (
            <AdminEmptyState title="No users found" description="Try a broader search or remove filters." />
          )
        ) : null}
      </AdminPanel>
    </div>
  );
}

export function AdminUserDetailPage() {
  const { userId } = useParams();
  const { data, isLoading, isError } = useAdminUser(userId);
  const statusMutation = useChangeAdminUserStatus();
  const user = data?.user;

  return (
    <div>
      <PageHeader eyebrow="Identity detail" title={user?.name ?? 'User profile'} description="Review activity, verification state, sessions, internal notes, and guarded user status actions." />
      {isLoading ? <AdminLoadingState /> : null}
      {isError ? <AdminErrorState message="User detail could not be loaded." /> : null}
      {user ? (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <AdminPanel title="Account" description={user.email ?? user.id}>
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminMetricCard label="Role" value={user.role} icon={Users} />
              <AdminMetricCard label="Status" value={user.isActive ? 'active' : 'inactive'} icon={ShieldCheck} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {adminUserStatusActions.map((action) => (
                <Button
                  key={action.key}
                  variant={action.tone === 'danger' ? 'destructive' : 'outline'}
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate({ userId, action: action.key, payload: { reason: `Admin ${action.label.toLowerCase()} action from console` } })}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </AdminPanel>
          <AdminPanel title="Recent verifications" description="Document and identity review history.">
            {data.verifications?.length ? data.verifications.map((item) => (
              <div key={item._id} className="mb-3 rounded-2xl border border-emerald-100 p-4">
                <div className="flex items-center justify-between gap-3"><p className="font-bold text-slate-950">{item.verificationType}</p><AdminStatusBadge value={item.status} /></div>
                <p className="mt-2 text-xs text-slate-500">{item.reviewNotes ?? item.rejectionReason ?? 'No review note recorded.'}</p>
              </div>
            )) : <AdminEmptyState title="No verification records" description="This user has not submitted verification documents yet." />}
          </AdminPanel>
          <AdminPanel title="Internal notes" description="Support-visible context stored by admins.">
            {data.notes?.length ? data.notes.map((note) => <p key={note._id} className="mb-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{note.content}</p>) : <AdminEmptyState title="No notes" description="No internal notes have been added for this user." />}
          </AdminPanel>
          <AdminPanel title="Recent sessions" description="Session history is returned only with private-view permissions.">
            {data.sessions?.length ? data.sessions.map((session) => <p key={session._id} className="mb-2 text-sm text-slate-600">{session.userAgent ?? 'Unknown device'}</p>) : <AdminEmptyState title="No sessions visible" description="No recent sessions were returned for this account." />}
          </AdminPanel>
        </div>
      ) : null}
    </div>
  );
}

export function AdminVerificationsPage() {
  const { data, isLoading, isError } = useAdminVerifications();
  return (
    <div>
      <PageHeader eyebrow="Trust" title="Verifications" description="Review identity, worker, owner, and document submissions before marketplace trust signals are updated." />
      <AdminPanel title="Verification queue" description="Each action is logged and notifies the user.">
        {isLoading ? <AdminLoadingState /> : null}
        {isError ? <AdminErrorState message="Verification queue could not be loaded." /> : null}
        {data?.verifications?.length ? data.verifications.map((item) => (
          <Link key={item._id} to={`/admin/verifications/${item._id}`} className="mb-3 block rounded-2xl border border-emerald-100 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="font-bold text-slate-950">{item.verificationType}</p><p className="text-sm text-slate-500">{item.userId?.name ?? 'Unknown user'}</p></div>
              <AdminStatusBadge value={item.status} />
            </div>
          </Link>
        )) : !isLoading && <AdminEmptyState title="Queue is clear" description="There are no matching verification records." />}
      </AdminPanel>
    </div>
  );
}

export function AdminVerificationDetailPage() {
  const { verificationId } = useParams();
  const { data, isLoading, isError } = useAdminVerification(verificationId);
  const mutation = useUpdateAdminVerification();
  const verification = data?.verification;

  return (
    <div>
      <PageHeader eyebrow="Verification review" title={verification?.verificationType ?? 'Verification'} description="Approve, reject, assign, or request resubmission with an auditable action trail." />
      {isLoading ? <AdminLoadingState /> : null}
      {isError ? <AdminErrorState message="Verification detail could not be loaded." /> : null}
      {verification ? (
        <AdminPanel title="Submission" description={verification.userId?.name ?? verification.userId?._id}>
          <div className="mb-5 flex flex-wrap items-center gap-3"><AdminStatusBadge value={verification.status} /><span className="text-sm text-slate-500">{verification.reviewNotes ?? verification.rejectionReason ?? 'No notes yet.'}</span></div>
          <div className="flex flex-wrap gap-2">
            {adminVerificationActions.map((action) => (
              <Button
                key={action.key}
                variant={action.key === 'reject' ? 'destructive' : 'outline'}
                disabled={mutation.isPending}
                onClick={() => mutation.mutate({ verificationId, action: action.key, payload: action.key.includes('reject') || action.key.includes('resubmission') ? { reason: 'Admin requested changes from review console' } : { reviewNotes: 'Reviewed from admin console' } })}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </AdminPanel>
      ) : null}
    </div>
  );
}

export function AdminAccountsPage() {
  const { data, isLoading, isError } = useAdminAccounts();
  return (
    <div>
      <PageHeader eyebrow="Access control" title="Admin accounts" description="Manage internal admin profiles, roles, departments, and permission versions." />
      <AdminPanel title="Admins" description="Role changes are applied through backend permission resolution.">
        {isLoading ? <AdminLoadingState /> : null}
        {isError ? <AdminErrorState message="Admin accounts could not be loaded." /> : null}
        {data?.admins?.length ? data.admins.map((admin) => (
          <div key={admin._id} className="mb-3 rounded-2xl border border-emerald-100 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="font-bold text-slate-950">{admin.displayName}</p><p className="text-sm text-slate-500">{admin.userId?.email ?? admin.adminCode}</p></div>
              <AdminStatusBadge value={admin.status} />
            </div>
          </div>
        )) : !isLoading && <AdminEmptyState title="No admin accounts" description="Create an admin profile from the backend API when needed." />}
      </AdminPanel>
    </div>
  );
}

export function AdminRolesPage() {
  const rolesQuery = useAdminRoles();
  const permissionsQuery = useAdminPermissions();
  return (
    <div>
      <PageHeader eyebrow="Permissions" title="Roles and permissions" description="Inspect system roles, custom roles, and the permission catalogue powering the admin module." />
      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <AdminPanel title="Roles" description="System roles are protected from deletion.">
          {rolesQuery.isLoading ? <AdminLoadingState /> : null}
          {rolesQuery.data?.roles?.map((role) => (
            <div key={role._id} className="mb-3 rounded-2xl border border-emerald-100 p-4">
              <div className="flex items-center justify-between gap-3"><p className="font-bold text-slate-950">{role.name}</p><AdminStatusBadge value={role.isSystemRole ? 'system' : 'custom'} /></div>
              <p className="mt-2 text-sm text-slate-500">{role.permissions?.length ?? 0} permissions</p>
            </div>
          ))}
        </AdminPanel>
        <AdminPanel title="Permission catalogue" description="Grouped by the main admin responsibility areas.">
          {permissionsQuery.isLoading ? <AdminLoadingState /> : null}
          {adminPermissionGroups.map((group) => (
            <div key={group.label} className="mb-4 rounded-2xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 font-bold text-slate-950"><group.icon className="h-4 w-4 text-emerald-700" />{group.label}</div>
              <div className="flex flex-wrap gap-2">{group.permissions.map((permission) => <AdminStatusBadge key={permission} value={permission} />)}</div>
            </div>
          ))}
        </AdminPanel>
      </div>
    </div>
  );
}

export function AdminAuditLogPage() {
  const { data, isLoading, isError } = useAdminAuditLogs();
  return (
    <div>
      <PageHeader eyebrow="Security" title="Audit logs" description="Immutable admin actions with request metadata, permission used, target, and result." />
      <AdminPanel title="Recent actions" description="Use backend filters for deeper incident review.">
        {isLoading ? <AdminLoadingState /> : null}
        {isError ? <AdminErrorState message="Audit logs could not be loaded." /> : null}
        {data?.logs?.length ? data.logs.map((log) => (
          <div key={log._id} className="mb-3 rounded-2xl border border-emerald-100 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p className="font-bold text-slate-950">{log.action}</p><AdminStatusBadge value={log.result} /></div>
            <p className="mt-2 text-sm text-slate-500">{log.targetType} {log.targetId ? `- ${log.targetId}` : ''}</p>
          </div>
        )) : !isLoading && <AdminEmptyState title="No audit logs" description="Admin actions will appear here after changes are made." />}
      </AdminPanel>
    </div>
  );
}

export function AdminSavedViewsPage() {
  const { data, isLoading, isError } = useAdminSavedViews();
  return (
    <div>
      <PageHeader eyebrow="Workspace" title="Saved views" description="Saved filters and table layouts for recurring review queues." />
      <AdminPanel title="Views" description="Views are scoped to the signed-in admin.">
        {isLoading ? <AdminLoadingState /> : null}
        {isError ? <AdminErrorState message="Saved views could not be loaded." /> : null}
        {data?.views?.length ? data.views.map((view) => (
          <div key={view._id} className="mb-3 rounded-2xl border border-emerald-100 p-4">
            <div className="flex items-center justify-between gap-3"><p className="font-bold text-slate-950">{view.name}</p><AdminStatusBadge value={view.resourceType} /></div>
          </div>
        )) : !isLoading && <AdminEmptyState title="No saved views" description="Saved views appear here after you store a filter layout." />}
      </AdminPanel>
    </div>
  );
}

export function AdminNotificationsPage() {
  const { data, isLoading, isError } = useAdminMe();
  return (
    <div>
      <PageHeader eyebrow="Preferences" title="Admin notifications" description="Review current admin digest and channel preferences returned by the backend." />
      {isLoading ? <AdminLoadingState /> : null}
      {isError ? <AdminErrorState message="Notification preferences could not be loaded." /> : null}
      {data?.preferences ? (
        <AdminPanel title="Preferences" description="Backend-backed settings for admin alerts.">
          <div className="grid gap-4 sm:grid-cols-3">
            <AdminMetricCard label="Digest" value={data.preferences.digestFrequency} icon={Bell} />
            <AdminMetricCard label="Channels" value={data.preferences.channels?.join(', ') || 'in-app'} icon={Bell} />
            <AdminMetricCard label="Categories" value={Object.keys(data.preferences.categories ?? {}).length} icon={Filter} />
          </div>
        </AdminPanel>
      ) : null}
    </div>
  );
}

export function AdminProfilePage() {
  const { data, isLoading, isError } = useAdminMe();
  return (
    <div>
      <PageHeader eyebrow="Profile" title="Admin profile" description="Your active admin profile, role grants, explicit denies, and security capabilities." />
      {isLoading ? <AdminLoadingState /> : null}
      {isError ? <AdminErrorState message="Admin profile could not be loaded." /> : null}
      {data ? (
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <AdminPanel title={data.profile?.displayName ?? 'Admin'} description={data.profile?.adminCode}>
            <div className="flex flex-wrap gap-2">{data.roles?.map((role) => <AdminStatusBadge key={role.id} value={role.name} />)}</div>
          </AdminPanel>
          <AdminPanel title="Effective permissions" description="Deny overrides are applied before permissions are returned.">
            <div className="flex max-h-96 flex-wrap gap-2 overflow-auto pr-2">{data.permissions?.map((permission) => <AdminStatusBadge key={permission} value={permission} />)}</div>
          </AdminPanel>
        </div>
      ) : null}
    </div>
  );
}

export function AdminSettingsPage() {
  const { data } = useAdminMe();
  return (
    <div>
      <PageHeader eyebrow="Configuration" title="Admin settings" description="Runtime security switches exposed safely from backend environment configuration." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="2FA required" value={data?.security?.require2fa ? 'Yes' : 'No'} icon={LockKeyhole} />
        <AdminMetricCard label="Impersonation" value={data?.security?.impersonationEnabled ? 'Enabled' : 'Disabled'} icon={Eye} />
        <AdminMetricCard label="Audit trail" value="Enabled" icon={ClipboardList} />
        <AdminMetricCard label="Access mode" value="Role based" icon={ShieldCheck} />
      </div>
    </div>
  );
}
