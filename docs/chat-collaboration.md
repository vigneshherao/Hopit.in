# Chat Collaboration

Hopt It chat now includes a collaboration layer on top of the real-time conversation foundation.

## Features

- Message reactions with one reaction per user per message
- Conversation-member mentions using `@name`, `@farmer`, `@manager`, and `@worker`
- Pinned messages with a 20-pin limit per conversation
- Personal starred messages
- Message threads and thread replies
- Shared notes with version increments
- Announcements with `normal`, `important`, and `critical` priority
- Personal bookmarks for messages, notes, and announcements
- Socket events for live collaboration updates

## Models

- `MessageReaction`
- `MessageMention`
- `PinnedMessage`
- `StarredMessage`
- `SharedNote`
- `Announcement`
- `Bookmark`

Thread metadata is stored on `Message` using `threadRootMessageId`, `threadReplyCount`, `threadLastReplyAt`, `threadResolvedAt`, `threadResolvedBy`, and `threadParticipantIds`.

## API Routes

All routes require JWT authentication and conversation membership.

```text
POST   /api/v1/chat/reactions
DELETE /api/v1/chat/reactions
GET    /api/v1/chat/mentions
GET    /api/v1/chat/pins
POST   /api/v1/chat/pins
DELETE /api/v1/chat/pins
GET    /api/v1/chat/starred
POST   /api/v1/chat/starred
DELETE /api/v1/chat/starred
GET    /api/v1/chat/threads
POST   /api/v1/chat/threads
GET    /api/v1/chat/notes
POST   /api/v1/chat/notes
PATCH  /api/v1/chat/notes/:noteId
DELETE /api/v1/chat/notes/:noteId
GET    /api/v1/chat/announcements
POST   /api/v1/chat/announcements
PATCH  /api/v1/chat/announcements/:announcementId
DELETE /api/v1/chat/announcements/:announcementId
GET    /api/v1/chat/bookmarks
POST   /api/v1/chat/bookmarks
DELETE /api/v1/chat/bookmarks
```

## Socket Events

Client events:

```text
message-react
message-unreact
message-star
message-unstar
message-pin
message-unpin
thread-reply
note-update
announcement-create
```

Server events:

```text
reaction-added
reaction-removed
mention-created
thread-updated
message-pinned
message-unpinned
message-starred
message-unstarred
announcement-created
note-updated
```

## Permissions

- Users must be active conversation members to read collaboration data.
- Users must have send permission to create notes and thread replies.
- Message pins require conversation edit permission or message ownership.
- Announcements require elevated conversation permissions.
- Stars and bookmarks are private to the requesting user.
- Mentions are restricted to active conversation members.

## Notifications

Notifications are created for mentions, reactions, pinned messages, thread replies, announcements, and shared notes.

## Frontend

The `/messages` workspace includes a reaction bar, emoji picker, mention autocomplete, pinned message section, starred messages, thread sidebar, shared note editor, and announcement banner/cards.

## Testing

```bash
npm run test --workspace backend -- chat
npm run test --workspace frontend -- chat
```
