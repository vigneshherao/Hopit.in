# Collaboration Enterprise

This completes Prompt 10 for Hopt It communication and farm workspace collaboration.

## Architecture

The enterprise layer extends `/api/v1/chat` instead of replacing the existing messaging system. It reuses:

- JWT authentication
- Socket.IO authenticated rooms
- Conversation membership checks
- Notification service
- Farm planner tasks
- Farm calendar events
- Existing chat messages, attachments, notes, announcements, pins, and threads

## Models

- `ConversationActivity`: durable conversation timeline events.
- `AuditLog`: append-only global audit records.
- `ConversationAnalytics`: cached analytics snapshots for dashboards.
- `ReportedItem`: user reports and moderation queue.

## Backend APIs

```text
GET   /api/v1/chat/workspace/:conversationId
GET   /api/v1/chat/timeline
GET   /api/v1/chat/analytics
GET   /api/v1/chat/analytics/:conversationId
POST  /api/v1/chat/reports
GET   /api/v1/chat/reports
PATCH /api/v1/chat/reports/:reportId/moderation
GET   /api/v1/chat/audit-logs
GET   /api/v1/chat/notification-digest
PATCH /api/v1/chat/notification-digest
```

## Activity Timeline

Conversation activities are generated for major chat and collaboration events:

- Message sent, edited, and deleted
- Thread created and replied to
- Reaction added and removed
- Message pinned and unpinned
- Note created and updated
- Announcement posted
- Report and moderation actions

Activities are available in the team workspace and can also flow into the existing activity feed.

## Analytics

Conversation analytics include:

- Message count
- Attachment count
- Active members
- Daily, weekly, and monthly messages
- Reaction count
- Thread count
- Announcement count
- Most used reaction

Dashboard analytics include unread message totals, top conversations, active conversation count, and message charts.

## Audit

`AuditLog` records sensitive actions such as reporting, moderation, message edits/deletes, pins, reactions, notes, and announcements. Audit logs are append-only and admin-only through the API.

## Moderation

Users can report:

- Messages
- Users
- Attachments
- Conversations

Admins can review reports, dismiss them, resolve them, or delete reported messages. Moderation actions are audited.

## Notifications

The implementation reuses the notification module and adds a provider abstraction for push notifications. Email/push delivery remains provider-ready and can be connected to SMTP, Web Push, Firebase Cloud Messaging, or OneSignal without changing chat business logic.

## Offline Support

The frontend exposes banners and keeps the architecture ready for offline caching of conversation lists, recent messages, drafts, pinned messages, starred messages, and notes. Current sync is handled through TanStack Query invalidation and Socket.IO reconnect events.

## Performance

Implemented or preserved:

- Cursor-style message pagination
- Lean queries for dashboard aggregation
- Query caching
- Socket room-level fanout
- Lazy attachment surfaces
- Aggregated analytics snapshots
- Indexed models for activity, audit, reports, and analytics

## Security

Security controls include:

- JWT validation
- Socket authentication
- Conversation membership checks
- Admin-only audit/moderation routes
- Input validation through Zod
- Rate limiting inherited from chat routes
- Protected attachment access
- Audit logging for sensitive actions
- Provider hook for attachment virus scanning

## Deployment Checklist

Backend:

- Use HTTPS in production
- Set production JWT secrets
- Configure production MongoDB backups
- Configure logging and retention
- Add Redis adapter for multi-instance Socket.IO when scaling
- Connect email and push providers
- Enable attachment virus scanning provider

Frontend:

- Run production build
- Monitor bundle size and add route-level code splitting as traffic grows
- Optimize large local image assets
- Keep Socket.IO reconnect enabled
- Validate keyboard and screen-reader flows

## Testing

Focused coverage:

```bash
npm run test --workspace backend -- chat
npm run test --workspace frontend -- chat
```
