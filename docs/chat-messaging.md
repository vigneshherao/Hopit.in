# Chat Messaging

Hopt It chat is a persisted real-time messaging foundation built on the Socket.IO infrastructure from Prompt 10 Part 1. It supports direct conversations, farm-team conversations, agreement/task contexts, custom groups, admin-support style routing, unread counts, receipts, attachments, location sharing, archive/mute/pin, blocking, and socket delivery.

## Conversation Architecture

Core collections:

- `Conversation`: conversation metadata, type, linked entity ids, deterministic direct key, last-message fields, and archive state.
- `ConversationMember`: membership, role, status, unread count, read pointer, mute/archive/pin preferences, and server-controlled permissions.
- `Message`: persisted messages with text, attachment refs, location ref, reply/forward refs, status, edit metadata, and deletion state.
- `MessageReceipt`: per-user delivered/read state.
- `ChatAttachment`: protected attachment metadata and file URLs.
- `ChatLocation`: one-time shared location records.
- `ConversationBlock`: direct-message block records.
- `ChatAuditLog`: append-only audit trail for membership, blocking, edits, deletes, and conversation changes.

Conversation membership is not embedded in `Conversation`, so groups can grow without bloating the main conversation document.

## Conversation Types

- `direct`: one-to-one user conversations with deterministic duplicate prevention.
- `farm-team`: farm-plan team communication.
- `agreement`: agreement parties and authorized support.
- `task`: task owner/assignee communication.
- `worker`: worker hiring communication.
- `manager`: farm manager operations.
- `admin-support`: user and support/admin channel.
- `custom-group`: authorized user-created groups.

## Backend Routes

Base route: `/api/v1/chat`

- `GET /conversations`
- `GET /conversations/:conversationId`
- `POST /conversations/direct`
- `POST /conversations/group`
- `PATCH /conversations/:conversationId`
- `POST /conversations/:conversationId/archive`
- `POST /conversations/:conversationId/unarchive`
- `POST /conversations/:conversationId/pin`
- `POST /conversations/:conversationId/unpin`
- `POST /conversations/:conversationId/mute`
- `POST /conversations/:conversationId/unmute`
- `POST /conversations/:conversationId/leave`
- `DELETE /conversations/:conversationId`
- `GET /conversations/:conversationId/members`
- `POST /conversations/:conversationId/members`
- `DELETE /conversations/:conversationId/members/:userId`
- `GET /conversations/:conversationId/messages`
- `POST /conversations/:conversationId/messages`
- `POST /conversations/:conversationId/read`
- `GET /messages/:messageId`
- `PATCH /messages/:messageId`
- `DELETE /messages/:messageId`
- `POST /messages/:messageId/forward`
- `POST /messages/:messageId/delivered`
- `POST /conversations/:conversationId/attachments`
- `GET /attachments/:attachmentId`
- `DELETE /attachments/:attachmentId`
- `POST /users/:userId/block`
- `POST /users/:userId/unblock`
- `GET /blocked-users`
- `GET /search/conversations`
- `GET /search/messages`

## Socket Events

Client-to-server:

- `chat:conversation:join`
- `chat:conversation:leave`
- `chat:message:send`
- `chat:message:delivered`
- `chat:message:read`
- `chat:typing:start`
- `chat:typing:stop`
- `chat:message:edit`
- `chat:message:delete`

Server-to-client:

- `chat:conversation:new`
- `chat:conversation:update`
- `chat:conversation:removed`
- `chat:member:added`
- `chat:member:removed`
- `chat:message:new`
- `chat:message:update`
- `chat:message:deleted`
- `chat:message:read`
- `chat:unread:update`
- `chat:error`

Conversation socket rooms use `conversation:{conversationId}` and can only be joined by active members.

## Message Lifecycle

1. Client creates a `clientMessageId`.
2. Message is sent by socket or HTTP fallback.
3. Backend validates membership, block status, payload, reply target, attachments, and location.
4. Message is persisted.
5. Conversation last-message fields are updated.
6. Recipient unread counts and receipts are updated.
7. The message is emitted to the conversation room.
8. Notifications are created for eligible non-sender members.

Repeated sends with the same `senderId + clientMessageId` return the existing persisted message.

## Receipts And Unread Counts

Unread counts live on `ConversationMember`. Read actions reset the member unread count, update `lastReadMessageId`, and update message receipts. Delivery receipts are persisted through socket events or HTTP fallback.

## Attachments

Supported attachment categories:

- Images: JPEG, PNG, WEBP
- Documents: PDF, DOCX, XLSX, CSV, TXT
- Voice: WEBM, OGG, MP3, MP4/M4A-style audio

Files are stored under the existing `/uploads` static path for local development. Metadata is persisted in MongoDB; binary file data is not stored in MongoDB.

## Location Sharing

Location messages are one-time records only. The app does not do continuous tracking, background tracking, or automatic location permission requests.

## Blocking

Blocking is scoped to direct messages. It prevents new direct messages but does not delete existing history or unrelated farm-team communication.

## Frontend Routes

- `/messages`
- `/messages/:conversationId`
- `/farm-planner/:farmPlanId/chat`
- `/agreements/:agreementId/chat`
- `/tasks/:taskId/chat`
- `/support/messages`

## Environment Variables

```env
CHAT_ENABLED=true
CHAT_MAX_MESSAGE_LENGTH=5000
CHAT_MAX_GROUP_MEMBERS=100
CHAT_MESSAGE_EDIT_WINDOW_MINUTES=15
CHAT_DELETE_FOR_EVERYONE_WINDOW_MINUTES=60
CHAT_MAX_IMAGE_SIZE_MB=10
CHAT_MAX_DOCUMENT_SIZE_MB=25
CHAT_MAX_VOICE_SIZE_MB=15
CHAT_MAX_VOICE_DURATION_SECONDS=300
CHAT_MAX_ATTACHMENTS_PER_MESSAGE=10
CHAT_ATTACHMENT_URL_EXPIRY_MINUTES=30
CHAT_TYPING_TIMEOUT_SECONDS=5
CHAT_MESSAGE_RATE_LIMIT_PER_MINUTE=60
CHAT_CONVERSATION_CREATE_LIMIT_PER_HOUR=20
CHAT_SEARCH_LIMIT_PER_MINUTE=30
CHAT_ATTACHMENT_SCAN_ENABLED=false
```

## Known Limitations

This milestone does not implement voice calls, video calls, mentions, reactions, pinned individual messages, starred messages, full threads, collaborative notes, or a moderation dashboard. Those are intentionally reserved for later prompts.
