export const ADMIN_ROLE_SLUGS = [
  'super-admin',
  'platform-admin',
  'user-admin',
  'verification-admin',
  'marketplace-admin',
  'support-admin',
  'moderation-admin',
  'analytics-admin',
  'content-admin',
  'finance-admin',
  'security-admin',
  'read-only-admin',
] as const;

export const ADMIN_PROFILE_STATUSES = ['active', 'inactive', 'suspended', 'invited'] as const;
export const ADMIN_ACTION_RESULTS = ['success', 'denied', 'failed'] as const;
export const USER_ACCOUNT_STATUSES = ['active', 'pending', 'suspended', 'restricted', 'blocked', 'deactivated', 'deleted'] as const;
export const VERIFICATION_TYPES = ['identity', 'email', 'phone', 'land-owner', 'farmer', 'worker', 'farm-manager', 'organization'] as const;
export const VERIFICATION_STATUSES = ['not-submitted', 'pending', 'under-review', 'approved', 'rejected', 'expired', 'needs-resubmission'] as const;
export const IMPERSONATION_STATUSES = ['active', 'ended', 'expired', 'revoked'] as const;
export const ADMIN_NOTE_VISIBILITIES = ['support', 'admin', 'security'] as const;
export const SAVED_VIEW_RESOURCES = ['users', 'verifications', 'admins', 'audit-logs'] as const;

export const ADMIN_PERMISSIONS = {
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_SUSPEND: 'users.suspend',
  USERS_RESTORE: 'users.restore',
  USERS_DELETE: 'users.delete',
  USERS_VERIFY: 'users.verify',
  USERS_RESET_PASSWORD: 'users.reset-password',
  USERS_VIEW_PRIVATE: 'users.view-private',
  USERS_EXPORT: 'users.export',
  USERS_MANAGE_SESSIONS: 'users.manage-sessions',
  USERS_IMPERSONATE: 'users.impersonate',
  ADMINS_VIEW: 'admins.view',
  ADMINS_CREATE: 'admins.create',
  ADMINS_UPDATE: 'admins.update',
  ADMINS_DEACTIVATE: 'admins.deactivate',
  ADMINS_ASSIGN_ROLES: 'admins.assign-roles',
  ADMINS_ASSIGN_PERMISSIONS: 'admins.assign-permissions',
  ADMINS_VIEW_AUDIT: 'admins.view-audit',
  DASHBOARD_VIEW: 'dashboard.view',
  SYSTEM_SETTINGS_VIEW: 'system.settings.view',
  SYSTEM_SETTINGS_UPDATE: 'system.settings.update',
  SYSTEM_NOTIFICATIONS_SEND: 'system.notifications.send',
  SYSTEM_HEALTH_VIEW: 'system.health.view',
  SECURITY_LOGIN_HISTORY_VIEW: 'security.login-history.view',
  SECURITY_SESSIONS_REVOKE: 'security.sessions.revoke',
  SECURITY_AUDIT_VIEW: 'security.audit.view',
  SECURITY_SUSPICIOUS_ACTIVITY_VIEW: 'security.suspicious-activity.view',
  SUPPORT_USERS_VIEW: 'support.users.view',
  SUPPORT_CONVERSATIONS_VIEW: 'support.conversations.view',
  SUPPORT_NOTES_CREATE: 'support.notes.create',
  MODERATION_VIEW: 'moderation.view',
  MODERATION_REVIEW: 'moderation.review',
  MODERATION_ASSIGN: 'moderation.assign',
  MODERATION_APPROVE: 'moderation.approve',
  MODERATION_ESCALATE: 'moderation.escalate',
  MODERATION_REMOVE: 'moderation.remove',
} as const;

export const ADMIN_PERMISSION_CATALOG = Object.values(ADMIN_PERMISSIONS);

const allPermissions = ADMIN_PERMISSION_CATALOG;

export const ADMIN_ROLE_DEFAULT_PERMISSIONS: Record<(typeof ADMIN_ROLE_SLUGS)[number], readonly string[]> = {
  'super-admin': allPermissions,
  'platform-admin': [
    ADMIN_PERMISSIONS.DASHBOARD_VIEW,
    ADMIN_PERMISSIONS.USERS_VIEW,
    ADMIN_PERMISSIONS.USERS_VIEW_PRIVATE,
    ADMIN_PERMISSIONS.USERS_UPDATE,
    ADMIN_PERMISSIONS.USERS_SUSPEND,
    ADMIN_PERMISSIONS.USERS_RESTORE,
    ADMIN_PERMISSIONS.USERS_MANAGE_SESSIONS,
    ADMIN_PERMISSIONS.ADMINS_VIEW,
    ADMIN_PERMISSIONS.SYSTEM_NOTIFICATIONS_SEND,
    ADMIN_PERMISSIONS.SECURITY_LOGIN_HISTORY_VIEW,
    ADMIN_PERMISSIONS.MODERATION_VIEW,
    ADMIN_PERMISSIONS.MODERATION_REVIEW,
    ADMIN_PERMISSIONS.MODERATION_ASSIGN,
    ADMIN_PERMISSIONS.MODERATION_APPROVE,
    ADMIN_PERMISSIONS.MODERATION_ESCALATE,
  ],
  'user-admin': [
    ADMIN_PERMISSIONS.DASHBOARD_VIEW,
    ADMIN_PERMISSIONS.USERS_VIEW,
    ADMIN_PERMISSIONS.USERS_VIEW_PRIVATE,
    ADMIN_PERMISSIONS.USERS_UPDATE,
    ADMIN_PERMISSIONS.USERS_SUSPEND,
    ADMIN_PERMISSIONS.USERS_RESTORE,
    ADMIN_PERMISSIONS.USERS_MANAGE_SESSIONS,
    ADMIN_PERMISSIONS.SECURITY_LOGIN_HISTORY_VIEW,
  ],
  'verification-admin': [ADMIN_PERMISSIONS.DASHBOARD_VIEW, ADMIN_PERMISSIONS.USERS_VIEW, ADMIN_PERMISSIONS.USERS_VERIFY, ADMIN_PERMISSIONS.MODERATION_VIEW, ADMIN_PERMISSIONS.MODERATION_REVIEW],
  'marketplace-admin': [ADMIN_PERMISSIONS.DASHBOARD_VIEW, ADMIN_PERMISSIONS.USERS_VIEW, ADMIN_PERMISSIONS.MODERATION_VIEW, ADMIN_PERMISSIONS.MODERATION_REVIEW, ADMIN_PERMISSIONS.MODERATION_APPROVE],
  'support-admin': [ADMIN_PERMISSIONS.DASHBOARD_VIEW, ADMIN_PERMISSIONS.SUPPORT_USERS_VIEW, ADMIN_PERMISSIONS.SUPPORT_NOTES_CREATE, ADMIN_PERMISSIONS.USERS_VIEW],
  'moderation-admin': [
    ADMIN_PERMISSIONS.DASHBOARD_VIEW,
    ADMIN_PERMISSIONS.USERS_VIEW,
    ADMIN_PERMISSIONS.USERS_SUSPEND,
    ADMIN_PERMISSIONS.USERS_RESTORE,
    ADMIN_PERMISSIONS.MODERATION_VIEW,
    ADMIN_PERMISSIONS.MODERATION_REVIEW,
    ADMIN_PERMISSIONS.MODERATION_ASSIGN,
    ADMIN_PERMISSIONS.MODERATION_ESCALATE,
  ],
  'analytics-admin': [ADMIN_PERMISSIONS.DASHBOARD_VIEW, ADMIN_PERMISSIONS.SECURITY_SUSPICIOUS_ACTIVITY_VIEW],
  'content-admin': [ADMIN_PERMISSIONS.DASHBOARD_VIEW],
  'finance-admin': [ADMIN_PERMISSIONS.DASHBOARD_VIEW],
  'security-admin': [
    ADMIN_PERMISSIONS.DASHBOARD_VIEW,
    ADMIN_PERMISSIONS.USERS_VIEW,
    ADMIN_PERMISSIONS.USERS_VIEW_PRIVATE,
    ADMIN_PERMISSIONS.USERS_MANAGE_SESSIONS,
    ADMIN_PERMISSIONS.SECURITY_LOGIN_HISTORY_VIEW,
    ADMIN_PERMISSIONS.SECURITY_SESSIONS_REVOKE,
    ADMIN_PERMISSIONS.SECURITY_AUDIT_VIEW,
    ADMIN_PERMISSIONS.ADMINS_VIEW_AUDIT,
  ],
  'read-only-admin': [ADMIN_PERMISSIONS.DASHBOARD_VIEW, ADMIN_PERMISSIONS.USERS_VIEW, ADMIN_PERMISSIONS.ADMINS_VIEW],
};

export const ADMIN_SOCKET_EVENTS = {
  DASHBOARD_UPDATE: 'admin:dashboard:update',
  USER_CREATED: 'admin:user:created',
  USER_STATUS_CHANGED: 'admin:user:status-changed',
  USER_SESSION_REVOKED: 'admin:user:session-revoked',
  VERIFICATION_NEW: 'admin:verification:new',
  VERIFICATION_UPDATED: 'admin:verification:updated',
  VERIFICATION_ASSIGNED: 'admin:verification:assigned',
  AUDIT_NEW: 'admin:audit:new',
  NOTIFICATION_NEW: 'admin:notification:new',
  PERMISSION_CHANGED: 'admin:permission:changed',
  MODERATION_QUEUE_UPDATED: 'admin:moderation:queue-updated',
  MODERATION_LISTING_ASSIGNED: 'admin:moderation:listing-assigned',
  MODERATION_REVIEW_COMPLETED: 'admin:moderation:review-completed',
  MODERATION_REVISION_SUBMITTED: 'admin:moderation:revision-submitted',
} as const;
