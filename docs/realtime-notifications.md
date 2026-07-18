# Realtime Notifications

Hopt It now has a reusable real-time communication foundation for notifications, activity updates, user presence, and future chat/collaboration features.

## Socket Architecture

Socket.IO is attached to the existing backend HTTP server. The socket layer lives under `backend/src/socket`:

- `socketServer.ts`: creates the Socket.IO server.
- `socketAuth.ts`: authenticates sockets using JWT access tokens.
- `socketEvents.ts`: registers client event handlers.
- `socketRooms.ts`: builds and validates user, farm, agreement, task, and admin rooms.
- `socketPresence.ts`: tracks online/offline state and user sessions.
- `socketNotifications.ts`: handles notification read events.
- `socketActivity.ts`: handles activity acknowledgement events.
- `socketMiddleware.ts`: lightweight event rate limiting and safe room joins.
- `socketConstants.ts`: shared event names and timing values.

Frontend socket hooks live in `frontend/src/hooks/useSocket.js`.

## Notification Flow

```text
Domain event -> notification service -> MongoDB Notification -> Socket.IO emit -> React Query invalidation -> Bell/dropdown/page update
```

REST routes:

- `GET /api/v1/notifications`
- `GET /api/v1/notifications/unread`
- `GET /api/v1/notifications/preferences`
- `PATCH /api/v1/notifications/preferences`
- `PATCH /api/v1/notifications/:id/read`
- `PATCH /api/v1/notifications/read-all`
- `DELETE /api/v1/notifications/:id`
- `DELETE /api/v1/notifications/clear`

Notification types include system, agreement, application, worker, task, reminder, expense, income, weather, disease, monitoring, admin, security, and general.

## Activity Feed

Activities are persistent timeline records for events such as farm creation, task creation/completion, agreement signing, AI analysis, disease detection, weather warning, and monitoring reports.

REST routes:

- `GET /api/v1/activity`
- `GET /api/v1/activity/farm/:id`
- `GET /api/v1/activity/agreement/:id`
- `GET /api/v1/activity/task/:id`

Activities support search, pagination, entity filters, visibility, and dedupe keys to avoid duplicate records.

## Presence System

Sockets update user presence on connect, heartbeat, manual presence update, and disconnect.

- Heartbeat interval: 30 seconds.
- Inactive timeout target: 90 seconds.
- Status values: online, offline, away, busy, invisible.

REST routes:

- `GET /api/v1/presence/:userId`
- `GET /api/v1/presence/team/:farmId`

## Rooms

Room names are stable and explicit:

- `user:{id}`
- `farm:{id}`
- `agreement:{id}`
- `task:{id}`
- `admin`

Room joins are validated against existing ownership and membership models. Users cannot join guessed farm, agreement, task, or admin rooms.

## Frontend

Routes:

- `/notifications`
- `/activity`

Components:

- `NotificationBell`
- `NotificationDropdown`
- `NotificationCard`
- `NotificationPreferenceForm`
- `UnreadBadge`
- `ActivityTimeline`
- `ActivityCard`
- `PresenceDot`
- `OnlineAvatar`

The header displays a live notification bell with unread count. Notification and activity pages hydrate through REST and refresh through socket events.

## Security

- Socket connections require JWT access tokens.
- Inactive users are rejected.
- Room access is validated server-side.
- Event rate limits protect join spam.
- Notification and activity APIs require authentication.
- Users can only read, update, or delete their own notification records.

## Testing

Backend tests cover notification CRUD, preference defaults, activity dedupe, presence lookup, socket authentication, and online presence updates.

Frontend tests cover notification center rendering, notification bell rendering, read action wiring, and the activity timeline.
