# API overview

The Express API is mounted at `/api/v1`. Major resources include authentication, lands, applications, agreements, workers, bookings, farm management, planning, weather, disease analysis, remote monitoring, AI assistance, chat, notifications, activity, admin, and moderation.

Protected endpoints accept `Authorization: Bearer <access-token>`. Refresh tokens use an HttpOnly cookie. Successful responses use `{ success, message, data }`; failures include `{ success: false, error: { code, message, fields? }, requestId }`. Write requests are validated with Zod and list endpoints enforce bounded pagination defined by their route schemas.

Operational endpoints are `GET /health` and `GET /ready`. Source-of-truth request/response details live alongside each validator, route, and controller; an OpenAPI document is not currently generated.
