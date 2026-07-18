# Worker Hiring System

Hopt It supports a farm workforce marketplace for individual workers, farm managers, supervisors, skilled specialists, and long-term farm management assignments.

## Worker Profiles

Workers create one profile connected to their user account. Profiles include headline, bio, professional roles, skills, experience, languages, location, availability, pricing, preferences, verification status, documents, portfolio, ratings, completed jobs, profile views, and active status.

Public profile responses hide private document URLs and precise address details.

## Professional Roles

Supported roles include farm manager, farm supervisor, general farm worker, seasonal worker, tractor driver, harvester operator, irrigation specialist, soil specialist, organic farming expert, crop consultant, horticulture expert, dairy worker, poultry worker, fish farming worker, drone operator, and other agriculture roles.

## Farm Jobs

Owners and admins can post farm jobs for one day, recurring work, seasonal work, long-term contracts, and farm-management needs. Public users can browse open jobs. Workers can apply with proposed pricing, availability, cover notes, and work plans.

## Booking Lifecycle

```text
pending -> confirmed -> in-progress -> completed
pending -> cancelled
confirmed -> cancelled
```

Accepted applications create worker bookings. Hirers and workers can confirm, start, update progress, complete, cancel, and review bookings.

## Farm Management

Farm-management assignments connect an owner, land, and assigned manager. Managers can submit progress reports with crop health, progress percentage, completed work, next work, photos, and expenses. Owners can submit report feedback.

## API Routes

- `GET /api/v1/workers`
- `GET /api/v1/workers/:identifier`
- `GET /api/v1/workers/profile/me`
- `POST /api/v1/workers/profile`
- `PATCH /api/v1/workers/profile/me`
- `POST /api/v1/workers/profile/submit-verification`
- `PATCH /api/v1/workers/:id/verification`
- `GET /api/v1/farm-jobs`
- `POST /api/v1/farm-jobs`
- `GET /api/v1/farm-jobs/:identifier`
- `PATCH /api/v1/farm-jobs/:id`
- `PATCH /api/v1/farm-jobs/:id/status`
- `POST /api/v1/farm-jobs/:jobId/apply`
- `GET /api/v1/farm-jobs/applications/my`
- `GET /api/v1/farm-jobs/:jobId/applications`
- `POST /api/v1/farm-jobs/applications/:id/:action`
- `GET /api/v1/worker-bookings`
- `GET /api/v1/worker-bookings/:id`
- `POST /api/v1/worker-bookings/:id/confirm`
- `POST /api/v1/worker-bookings/:id/start`
- `POST /api/v1/worker-bookings/:id/progress`
- `POST /api/v1/worker-bookings/:id/complete`
- `POST /api/v1/worker-bookings/:id/cancel`
- `POST /api/v1/worker-bookings/:id/review`
- `GET /api/v1/farm-management`
- `POST /api/v1/farm-management`
- `GET /api/v1/farm-management/:id`
- `POST /api/v1/farm-management/:id/reports`
- `GET /api/v1/farm-management/:id/reports`
- `POST /api/v1/farm-management/reports/:reportId/feedback`

## Frontend Routes

- `/workers`
- `/workers/:id`
- `/worker/profile`
- `/worker/profile/edit`
- `/worker/dashboard`
- `/farm-jobs`
- `/farm-jobs/:identifier`
- `/farm-jobs/new`
- `/farm-jobs/:id/edit`
- `/my-farm-jobs`
- `/my-job-applications`
- `/worker-bookings`
- `/worker-bookings/:id`
- `/farm-management`
- `/farm-management/:id`
- `/farm-management/:id/reports/new`

## Permissions

- Public users can browse active workers and open jobs.
- Workers can create profiles, apply to jobs, manage applications, confirm bookings, update progress, and submit farm reports.
- Owners can post jobs, review worker applications, accept workers, manage bookings, and review farm-management reports.
- Admins can access and verify all worker hiring records.
