# Hopt It Admin Foundation

The admin foundation adds a permission-aware operations console for managing users, admin roles, verification queues, saved views, login history, impersonation records, and audit logs.

## Architecture

Backend routes are mounted under `/api/v1/admin` and require:

- A valid JWT access token.
- `user.role === "admin"`.
- An active `AdminProfile`.
- The permission required by each route.

Permissions are resolved in `adminPermission.util.ts`:

1. System roles are created idempotently when admin profile data is requested.
2. Active role permissions are combined.
3. Explicit allow overrides are added.
4. Explicit deny overrides are removed last.
5. `super-admin` receives every known permission except explicit denies.

## Models

- `AdminRole`
- `AdminProfile`
- `AdminPermissionOverride`
- `UserVerification`
- `UserStatusHistory`
- `AdminActionLog`
- `AdminSavedView`
- `AdminNotificationPreference`
- `ImpersonationSession`
- `LoginHistory`
- `AdminInternalNote`

## Core Routes

```text
GET    /api/v1/admin/me
PATCH  /api/v1/admin/me
GET    /api/v1/admin/dashboard/overview

GET    /api/v1/admin/users
GET    /api/v1/admin/users/:userId
PATCH  /api/v1/admin/users/:userId
POST   /api/v1/admin/users/:userId/suspend
POST   /api/v1/admin/users/:userId/restrict
POST   /api/v1/admin/users/:userId/restore
POST   /api/v1/admin/users/:userId/deactivate
POST   /api/v1/admin/users/:userId/reactivate
DELETE /api/v1/admin/users/:userId

GET    /api/v1/admin/verifications
GET    /api/v1/admin/verifications/:verificationId
POST   /api/v1/admin/verifications/:verificationId/assign
POST   /api/v1/admin/verifications/:verificationId/start-review
POST   /api/v1/admin/verifications/:verificationId/approve
POST   /api/v1/admin/verifications/:verificationId/reject
POST   /api/v1/admin/verifications/:verificationId/request-resubmission

GET    /api/v1/admin/admins
POST   /api/v1/admin/admins
GET    /api/v1/admin/admins/:adminId
PATCH  /api/v1/admin/admins/:adminId
POST   /api/v1/admin/admins/:adminId/activate
POST   /api/v1/admin/admins/:adminId/deactivate
POST   /api/v1/admin/admins/:adminId/roles
POST   /api/v1/admin/admins/:adminId/permission-overrides

GET    /api/v1/admin/roles
POST   /api/v1/admin/roles
GET    /api/v1/admin/roles/:roleId
PATCH  /api/v1/admin/roles/:roleId
DELETE /api/v1/admin/roles/:roleId

GET    /api/v1/admin/permissions
GET    /api/v1/admin/audit-logs
GET    /api/v1/admin/audit-logs/:auditLogId

GET    /api/v1/admin/saved-views
POST   /api/v1/admin/saved-views
PATCH  /api/v1/admin/saved-views/:viewId
DELETE /api/v1/admin/saved-views/:viewId
```

## Security Controls

- Admin profile status is checked on every admin request.
- Admin users cannot suspend or deactivate themselves.
- Non-super-admin users cannot change protected active admin accounts.
- User suspensions and deactivations revoke active refresh tokens.
- Login success and failure attempts are recorded in `LoginHistory`.
- Every state-changing admin action writes an `AdminActionLog`.
- Impersonation is disabled unless `ADMIN_IMPERSONATION_ENABLED=true`.
- Private email and phone data are only returned when the admin has `users.view-private`.

## Environment Variables

```bash
ADMIN_MODULE_ENABLED=true
ADMIN_IMPERSONATION_ENABLED=false
ADMIN_IMPERSONATION_MAX_MINUTES=15
ADMIN_RECENT_AUTH_WINDOW_MINUTES=10
ADMIN_MAX_BULK_ACTION_SIZE=100
ADMIN_AUDIT_RETENTION_DAYS=2555
ADMIN_DASHBOARD_CACHE_SECONDS=60
ADMIN_USER_EXPORT_MAX_ROWS=10000
ADMIN_REQUIRE_2FA=false
ADMIN_IP_ALLOWLIST_ENABLED=false
ADMIN_LOGIN_ALERTS_ENABLED=true
VERIFICATION_SIGNED_URL_EXPIRY_MINUTES=10
```

## Frontend Routes

```text
/admin
/admin/users
/admin/users/:userId
/admin/verifications
/admin/verifications/:verificationId
/admin/admins
/admin/roles
/admin/audit-logs
/admin/saved-views
/admin/notifications
/admin/profile
/admin/settings
```

The frontend uses `adminService.js` and `useAdmin.js` for all API access, keeping route components declarative and cache-aware.

## Operational Notes

Create the first admin by promoting a trusted user in the database, then create an `AdminProfile` with a system role such as `super-admin`. After that, admin accounts and role assignments can be managed through the API.
