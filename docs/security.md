# Security hardening

## Authentication

Access tokens are short-lived HS256 JWTs and are accepted only with the configured issuer and audience. Refresh tokens are opaque random values, stored only as SHA-256 hashes, rotated on refresh, revoked on logout, and sent in an HttpOnly cookie. Production startup rejects built-in development secrets, equal access/refresh secrets, and insecure cookie configuration should be avoided.

Every protected HTTP request reloads the user's active status and authoritative role. Socket authentication applies the same account-status check. Passwords are hashed with bcrypt cost 12 and excluded from normal queries and JSON output.

## API controls

- CORS accepts `CLIENT_URL` plus the comma-separated `ALLOWED_ORIGINS`; credentials are never combined with a wildcard.
- Helmet supplies CSP and standard browser security headers. JSON and form bodies are bounded.
- Authentication, AI, application, and global request limiters already protect high-risk paths. Rate-limit responses use `RATE_LIMITED`.
- Zod request middleware replaces request body, params, and query with parsed values. Route schemas must use strict field allow-lists for writes.
- Uploads are memory-backed, capped at 8 MB and 10 files, and require an allow-listed MIME/extension pair. SVG and executable formats are rejected.

Private documents must not be served from `/uploads`; use the existing signed-document flow. MIME checks do not replace production magic-byte inspection or antivirus scanning.

## Error and logging policy

Errors include a stable code and request ID. Stack traces, database details, and raw exception messages are not returned. Request logs include method, path without query string, status, duration, request ID, and authenticated user ID; passwords, tokens, bodies, AI prompts, and chat content are excluded.

## Remaining priorities

Refresh-token family reuse detection, password reset/email verification flows, magic-byte inspection, per-account login cooldowns, and CSRF tokens for any future cookie-authenticated write endpoints remain to be implemented. Current writes use bearer access tokens, reducing conventional CSRF exposure; refresh/logout still rely on SameSite cookies and strict CORS.
