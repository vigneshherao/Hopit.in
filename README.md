# Hopt It

Hopt It is an AI powered agriculture platform foundation connecting land owners, farmers, and farm workers. The project is organized as a modular monolith with a React frontend and an Express API backend.

## Tech Stack

- Frontend: React 19, Vite, JavaScript, Tailwind CSS, React Router, React Hook Form, TanStack Query, Axios, Framer Motion, Zod, shadcn-style UI primitives, Lucide Icons
- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose, JWT ready middleware, Multer, Cloudinary ready configuration, Zod validation
- Development: ESLint, Prettier, Husky, lint-staged, dotenv, nodemon
- Deployment: Vercel frontend and Render backend ready

## Installation

Run this from the project root:

```bash
npm install
```

This installs the root development tooling and both workspace applications.

## Environment Variables

Create environment files from the included examples:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Frontend variables:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Backend variables:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/hopit
JWT_ACCESS_SECRET=replace_with_a_long_random_access_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=replace_with_a_different_long_random_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
AI_REQUEST_TIMEOUT_MS=30000
AI_DAILY_REQUEST_LIMIT=25
SATELLITE_PROVIDER=demo
SATELLITE_REQUEST_TIMEOUT_MS=30000
SATELLITE_CACHE_TTL_MINUTES=360
REMOTE_MONITORING_DEMO_MODE=true
REMOTE_MONITORING_MAX_IMAGE_SIZE_MB=15
REMOTE_MONITORING_MAX_ORTHOMOSAIC_SIZE_MB=250
REMOTE_MONITORING_MAX_IMAGES_PER_SURVEY=50
MAP_TILE_BASE_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
SIGNED_FILE_URL_EXPIRY_MINUTES=30
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

## Running Frontend

```bash
npm run dev --workspace frontend
```

This starts Vite at `http://localhost:5173`.

## Running Backend

```bash
npm run dev --workspace backend
```

This starts the Express API at `http://localhost:5000/api/v1`.

Health check:

```bash
curl http://localhost:5000/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "uptime": 12.345
}
```

## Run Both Apps

```bash
npm run dev
```

This starts the frontend and backend workspaces together for local development.

## Available Scripts

Root:

- `npm install`: install all workspace dependencies.
- `npm run dev`: run frontend and backend together.
- `npm run lint`: lint frontend and backend.
- `npm run format`: format source, config, and documentation files.

Frontend:

- `npm run dev --workspace frontend`: start Vite.
- `npm run build --workspace frontend`: create a production build.
- `npm run preview --workspace frontend`: preview the production build.
- `npm run lint --workspace frontend`: run ESLint.

Backend:

- `npm run dev --workspace backend`: start nodemon with TypeScript.
- `npm run build --workspace backend`: compile TypeScript to `dist`.
- `npm start --workspace backend`: run compiled server.
- `npm run lint --workspace backend`: run ESLint.
- `npm run seed --workspace backend`: seed demo users, admin profiles, lands, applications, AI history, farm plans, tasks, workers, chat, verification records, saved views, and audit data.
- `npm run test --workspace backend`: run API tests.
- `npm run test --workspace frontend`: run frontend auth tests.

## Folder Structure

```text
Hopit.in/
  frontend/
    src/
      assets/
      components/
      context/
      hooks/
      layouts/
      pages/
      routes/
      services/
      types/
      utils/
  backend/
    src/
      config/
      controllers/
      interfaces/
      middleware/
      models/
      routes/
      services/
      types/
      utils/
      validators/
  docs/
```

## Deployment

### Frontend on Vercel

Use `frontend` as the project root.

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL`

### Backend on Render

Use `backend` as the service root.

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Required environment variables: all backend variables listed above.

## Notes

## Demo Data

Run MongoDB locally or set `MONGODB_URI` to your hosted database, then seed the app:

```bash
npm run seed --workspace backend
```

Demo password for seeded users:

```text
HoptIt@123
```

Useful demo accounts:

- `owner@hoptit.demo`
- `farmer@hoptit.demo`
- `worker@hoptit.demo`
- `manager@hoptit.demo`
- `admin@hoptit.demo`

## Authentication Architecture

Hopt It uses JWT access tokens plus rotating refresh tokens. Access tokens are short lived and sent with `Authorization: Bearer <token>`. Refresh tokens are random secrets stored only as SHA-256 hashes in MongoDB and sent to the browser through an HTTP-only cookie.

See [docs/authentication.md](/Users/vigneshhe/Desktop/Hopit.in/docs/authentication.md) for the full flow.

## Admin Foundation

Hopt It includes a permission-aware admin console for platform overview, user management, verification review, admin roles, permission overrides, saved views, login history, impersonation records, internal notes, and audit logs.

See [docs/admin-foundation.md](/Users/vigneshhe/Desktop/Hopit.in/docs/admin-foundation.md).

## Marketplace Moderation

Hopt It includes an admin marketplace moderation system for land listing queue review, assignment, checklist verification, document review, approval, rejection, revision, escalation, flags, versions, timelines, notifications, socket events, and audit logging.

See [docs/marketplace-moderation.md](/Users/vigneshhe/Desktop/Hopit.in/docs/marketplace-moderation.md).

## Land Marketplace

Hopt It includes a land marketplace for sale, lease, rent, joint venture, and revenue-share listings. Owners can create drafts, submit for verification, manage statuses, and upload images/documents. Public users can browse available listings with filters and map views.

See [docs/land-marketplace.md](/Users/vigneshhe/Desktop/Hopit.in/docs/land-marketplace.md).

## Application Workflow

Hopt It supports land applications, proposal negotiation, owner selection, and platform-generated draft agreement summaries.

See [docs/application-workflow.md](/Users/vigneshhe/Desktop/Hopit.in/docs/application-workflow.md).

## Worker Hiring System

Hopt It now supports a hiring marketplace for farm managers, supervisors, skilled agriculture workers, teams, farm jobs, worker bookings, and farm-management progress reporting.

See [docs/worker-hiring.md](/Users/vigneshhe/Desktop/Hopit.in/docs/worker-hiring.md).

## AI Land Analyzer

Hopt It includes authenticated AI land analysis, crop recommendation, business recommendation, chat, and saved history workflows. The frontend never receives AI provider secrets; all provider calls run through the backend.

See [docs/ai-land-analyzer.md](/Users/vigneshhe/Desktop/Hopit.in/docs/ai-land-analyzer.md).

## AI Farm Planner

Hopt It can convert a selected land and crop into a versioned farming execution plan with preparation, seeds, workers, equipment, expenses, timeline, harvest, risk, and profit projections.

Planner routes:

- `POST /api/v1/farm-planner/generate-plan`
- `GET /api/v1/farm-planner/plans`
- `GET /api/v1/farm-planner/plans/:id`
- `PATCH /api/v1/farm-planner/plans/:id`
- `DELETE /api/v1/farm-planner/plans/:id`
- `POST /api/v1/farm-planner/plans/:id/recalculate`
- `GET /api/v1/farm-planner/plans/:id/dashboard`

## Remote Monitoring

Hopt It includes farm-boundary mapping, demo satellite imagery requests, drone survey metadata, vegetation analysis, monitoring zones, field observations, comparisons, reports, and a crop-health dashboard for farm plans.

See [docs/remote-monitoring.md](/Users/vigneshhe/Desktop/Hopit.in/docs/remote-monitoring.md).

## Realtime Notifications

Hopt It includes Socket.IO infrastructure for authenticated live notifications, activity feeds, online presence, safe rooms, read status, and reusable event helpers.

See [docs/realtime-notifications.md](/Users/vigneshhe/Desktop/Hopit.in/docs/realtime-notifications.md).

## Chat Messaging

Hopt It includes persisted real-time messaging for direct, farm-team, agreement, task, worker, manager, admin-support, and custom-group conversations.

See [docs/chat-messaging.md](/Users/vigneshhe/Desktop/Hopit.in/docs/chat-messaging.md).

## Chat Collaboration

Hopt It chat supports reactions, mentions, pinned messages, starred messages, threads, shared notes, announcements, and bookmarks for farm workspace collaboration.

See [docs/chat-collaboration.md](/Users/vigneshhe/Desktop/Hopit.in/docs/chat-collaboration.md).

## Collaboration Enterprise

Hopt It includes production collaboration foundations for team workspaces, timelines, analytics, audit logs, reporting, moderation, digest settings, and push-provider readiness.

See [docs/collaboration-enterprise.md](/Users/vigneshhe/Desktop/Hopit.in/docs/collaboration-enterprise.md).

## Database Models

The backend includes foundation schemas for `User`, `RefreshToken`, `Land`, `Application`, `WorkerProfile`, `WorkerBooking`, `AIHistory`, and `Notification`.

## Auth API Routes

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/logout-all`
- `GET /api/v1/auth/me`
- `PATCH /api/v1/auth/me`
- `PATCH /api/v1/auth/change-password`

## Demo Credentials

Seed demo users:

```bash
npm run seed --workspace backend
```

Development-only password:

```text
HoptIt@123
```

Demo emails:

- `owner@hoptit.demo`
- `farmer@hoptit.demo`
- `worker@hoptit.demo`
- `admin@hoptit.demo`

## Security Notes

Use strong access and refresh secrets outside development. Set `COOKIE_SECURE=true` in production, keep CORS origins explicit, and never store refresh tokens in frontend storage.
