import {
  Activity,
  BadgeCheck,
  Bell,
  ClipboardList,
  Eye,
  Flag,
  LayoutDashboard,
  LockKeyhole,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  Users,
} from 'lucide-react';

export const adminNavItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Moderation', href: '/admin/moderation', icon: Flag },
  { label: 'Verifications', href: '/admin/verifications', icon: BadgeCheck },
  { label: 'Admins', href: '/admin/admins', icon: ShieldCheck },
  { label: 'Roles', href: '/admin/roles', icon: LockKeyhole },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: ClipboardList },
  { label: 'Saved Views', href: '/admin/saved-views', icon: Eye },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Profile', href: '/admin/profile', icon: UserCog },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export const adminMetricCards = [
  { key: 'users.total', label: 'Total users', accent: 'emerald' },
  { key: 'users.active', label: 'Active users', accent: 'green' },
  { key: 'lands.published', label: 'Published lands', accent: 'teal' },
  { key: 'alerts.pendingVerifications', label: 'Pending reviews', accent: 'purple' },
];

export const adminUserStatusActions = [
  { key: 'suspend', label: 'Suspend', tone: 'danger' },
  { key: 'restore', label: 'Restore', tone: 'success' },
  { key: 'deactivate', label: 'Deactivate', tone: 'warning' },
];

export const adminVerificationActions = [
  { key: 'start-review', label: 'Start review' },
  { key: 'approve', label: 'Approve' },
  { key: 'reject', label: 'Reject' },
  { key: 'request-resubmission', label: 'Request resubmission' },
];

export const adminPermissionGroups = [
  { label: 'Identity', icon: Users, permissions: ['users.view', 'users.view-private', 'users.update', 'users.suspend', 'users.restore', 'users.delete'] },
  { label: 'Verification', icon: BadgeCheck, permissions: ['users.verify', 'verifications.assign', 'verifications.approve', 'verifications.reject'] },
  { label: 'Administration', icon: ShieldCheck, permissions: ['admins.view', 'admins.create', 'admins.update', 'admins.deactivate', 'admins.assign-roles', 'admins.assign-permissions'] },
  { label: 'Security', icon: LockKeyhole, permissions: ['security.audit.view', 'security.sessions.revoke', 'security.login-history.view', 'users.impersonate'] },
  { label: 'Operations', icon: SlidersHorizontal, permissions: ['dashboard.view', 'saved-views.manage', 'support.users.view', 'support.notes.create'] },
];

export const adminActivityTypes = [
  { label: 'User status', value: 'user-suspended' },
  { label: 'Verification', value: 'verification-approved' },
  { label: 'Admin role', value: 'admin-role-updated' },
  { label: 'Impersonation', value: 'impersonation-started' },
  { label: 'Saved view', value: 'saved-view-updated' },
];

export const adminDashboardWidgets = [
  { label: 'New today', path: 'users.newToday', icon: Activity },
  { label: 'New this week', path: 'users.newThisWeek', icon: Activity },
  { label: 'Workers verified', path: 'workers.verified', icon: BadgeCheck },
  { label: 'Failed logins', path: 'alerts.failedLogins', icon: LockKeyhole },
];
