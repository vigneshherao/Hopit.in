# Hopt It Marketplace Moderation

Marketplace Moderation manages listing review before and after publishing. Part 2A focuses on land listing moderation while keeping the model open for worker profiles, farm manager profiles, equipment listings, and future marketplace modules.

## Workflow

```text
Submit listing
Pending queue
Moderator assigned
Checklist review
Document verification
Approve -> Published
Reject -> Rejected
Revision -> Owner updates -> Resubmit
Escalate -> Senior moderation/admin review
```

Existing land marketplace statuses are preserved. Moderation statuses map to current land statuses so public browsing continues to work:

- `pending-review`, `under-verification`, `escalated` -> `pending-verification`
- `published`, `approved` -> `available`
- `rejected`, `needs-revision` -> `rejected`
- `archived`, `hidden`, `removed` -> `inactive`

## Database Models

- `LandModeration`: queue record, assignment, status, checklist, document review state, comments, timeline, current version and flags count.
- `ModerationDecision`: immutable review decisions with reason, notes, checklist, documents, attachments and reviewer.
- `ModeratorAssignment`: assignment history for self, admin and auto assignment modes.
- `ListingVersion`: immutable listing snapshots with field-level diffs.
- `ListingFlag`: manual or automatic listing flags with reason, source, priority and status.

## Checklist

Moderators review:

- Owner name
- Location
- Coordinates
- Land area
- Survey number
- Ownership documents
- Crop type
- Photos
- Price
- Description
- Water availability
- Electricity
- Road access

Each checklist result is `pass`, `fail`, or `needs-review`.

## Document Verification

Supported document review types:

- Ownership certificate
- Tax receipt
- Survey document
- Identity proof
- Lease agreement
- Supporting document

Document records include virus scan status, OCR status, OCR text, confidence, review status, expiry and verification result. OCR is architecture-ready; real providers such as Google Vision, AWS Textract or Azure OCR are intentionally not implemented in Part 2A.

## Admin APIs

All routes require JWT auth, active admin profile and moderation permission.

```text
GET  /api/v1/admin/moderation/queue
GET  /api/v1/admin/moderation/pending
GET  /api/v1/admin/moderation/approved
GET  /api/v1/admin/moderation/rejected
GET  /api/v1/admin/moderation/revision
GET  /api/v1/admin/moderation/history
GET  /api/v1/admin/moderation/:moderationId

POST /api/v1/admin/moderation/assign
POST /api/v1/admin/moderation/review
POST /api/v1/admin/moderation/decision
POST /api/v1/admin/moderation/approve
POST /api/v1/admin/moderation/reject
POST /api/v1/admin/moderation/revision
POST /api/v1/admin/moderation/escalate
POST /api/v1/admin/moderation/archive
POST /api/v1/admin/moderation/hide
POST /api/v1/admin/moderation/remove
POST /api/v1/admin/moderation/flags
```

## Query Filters

Queue routes support:

- `cursor`
- `limit`
- `status`
- `queue`
- `assignedModerator`
- `priority`
- `district`
- `crop`
- `q`
- `createdFrom`
- `createdTo`
- `updatedFrom`
- `updatedTo`
- `sort`

Sort options:

- `newest`
- `oldest`
- `priority`
- `submission-time`
- `review-time`

## Permissions

- `moderation.view`: queue and detail access.
- `moderation.review`: checklist, reject and revision actions.
- `moderation.assign`: self/admin assignment.
- `moderation.approve`: approve, hide and archive.
- `moderation.escalate`: escalation.
- `moderation.remove`: permanent removal action gate.

Every state-changing route writes `AdminActionLog`.

## Notifications

The owner receives notifications when a listing is assigned, approved, rejected, revision-requested, escalated, hidden, archived or removed.

## Socket Events

```text
moderation:queue-updated
moderation:listing-assigned
moderation:review-completed
moderation:revision-submitted
```

Events are emitted to the admin room and, when relevant, the listing owner room.

## Frontend Routes

```text
/admin/moderation
/admin/moderation/:moderationId
```

Main components:

- `ModerationQueuePage`
- `ModerationDetailPage`
- `ModerationCard`
- `ModerationTable`
- `ChecklistPanel`
- `DocumentViewer`
- `VersionHistory`
- `AuditTimeline`

## Seed Data

The seed script creates 250 moderation land listings:

- 80 pending review
- 40 approved
- 30 rejected
- 20 needs revision
- 10 escalated
- 70 additional under-verification, published, hidden and archived examples

Run:

```bash
npm run seed --workspace backend
```

MongoDB must be running or `MONGODB_URI` must point to a reachable database.

## Not Included In Part 2A

The following are reserved for Prompt 11 Part 2B:

- Fraud detection engine
- Dispute resolution
- Appeals
- Trust score
- AI moderation
- Risk scoring
- Bulk moderation
- Marketplace analytics
