# Application Workflow

Hopit supports land applications, proposals, negotiations, owner selection, and platform-generated agreement draft summaries.

## Lifecycle

Recommended path:

```text
draft -> submitted -> under-review -> shortlisted -> accepted -> agreement-pending -> agreement-ready -> completed
```

Alternative terminal or side paths:

```text
submitted -> rejected
submitted -> withdrawn
shortlisted -> changes-requested
changes-requested -> submitted
accepted -> cancelled
```

Status transitions are centralized in `APPLICATION_STATUS_TRANSITIONS`.

## Roles

- `farmer`: apply, negotiate, withdraw, accept terms, view agreement.
- `owner`: apply to other owners' land, review received applications, negotiate, accept one application, view agreement.
- `admin`: manage all application and agreement workflows.
- `worker`: cannot apply for land.

## Application Types

- `lease`
- `rent`
- `sale-enquiry`
- `joint-venture`
- `revenue-share`
- `business-proposal`

Application type compatibility is checked against land transaction types and land purposes.

## API Routes

Applications:

- `POST /api/v1/applications`
- `POST /api/v1/applications/:id/submit`
- `GET /api/v1/applications/my`
- `GET /api/v1/applications/received`
- `GET /api/v1/applications/:id`
- `PATCH /api/v1/applications/:id`
- `POST /api/v1/applications/:id/withdraw`
- `POST /api/v1/applications/:id/review`
- `POST /api/v1/applications/:id/shortlist`
- `POST /api/v1/applications/:id/request-changes`
- `POST /api/v1/applications/:id/reject`
- `POST /api/v1/applications/:id/negotiate`
- `POST /api/v1/applications/:id/accept-terms`
- `POST /api/v1/applications/:id/accept`
- `POST /api/v1/applications/:id/cancel`
- `GET /api/v1/applications/statistics`
- `POST /api/v1/applications/upload/documents`

Agreements:

- `GET /api/v1/agreements/:id`
- `POST /api/v1/agreements/:id/regenerate`
- `POST /api/v1/agreements/:id/request-changes`
- `POST /api/v1/agreements/:id/legal-review`

## Negotiation Rules

Each negotiation action creates an immutable `ApplicationNegotiation` record. Round numbers increase monotonically. A user cannot accept their own latest counter-offer unless they are an admin.

## Acceptance Flow

When an owner accepts an application:

1. The selected application moves to `agreement-pending`.
2. The land moves to `reserved`.
3. Other active applications for the land are closed as rejected.
4. A draft `Agreement` summary is generated.
5. Notifications are created for both parties.

## Agreement Disclaimer

This is a platform-generated draft summary and is not legal advice or a legally executed agreement. Parties should consult a qualified legal professional and complete applicable registration, stamp-duty, and statutory requirements.

## Frontend Routes

- `/lands/:identifier/apply`
- `/my-applications`
- `/my-applications/:id`
- `/received-applications`
- `/received-applications/:id`
- `/agreements/:id`

## Seed Data

The seed script creates demo users, land listings, and can be extended for demo applications once a local MongoDB server is running:

```bash
npm run seed --workspace backend
```

## Testing

```bash
npm run test --workspace backend
npm run test --workspace frontend
```
