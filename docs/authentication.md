# Authentication

Hopit uses short-lived JWT access tokens and rotating refresh tokens.

## Roles

Supported roles are `owner`, `farmer`, `worker`, and `admin`. Public registration allows only `owner`, `farmer`, and `worker`; admin users are created through trusted operational paths such as the development seed.

## Token Flow

1. `/api/v1/auth/register` or `/api/v1/auth/login` validates credentials.
2. The API returns a safe user object and an access token.
3. The API stores only a SHA-256 hash of the refresh token in MongoDB.
4. The raw refresh token is set in an HTTP-only cookie scoped to `/api/v1/auth`.
5. `/api/v1/auth/refresh` rotates the refresh token by revoking the previous record and issuing a new token.
6. `/api/v1/auth/logout` revokes the active refresh token.
7. `/api/v1/auth/logout-all` revokes every active refresh token for the authenticated user.

The frontend keeps the access token in memory with `sessionStorage` as a hackathon-friendly fallback. Refresh tokens are never stored in browser JavaScript storage.

## API Routes

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/logout-all`
- `GET /api/v1/auth/me`
- `PATCH /api/v1/auth/me`
- `PATCH /api/v1/auth/change-password`

## Protected Routes

`authenticate` verifies `Authorization: Bearer <accessToken>` and attaches `req.user`.

`authorize("owner", "admin")` restricts an authenticated route to selected roles.

`optionalAuthenticate` attaches a user when a valid token is present but allows anonymous requests.

Frontend protected routes redirect anonymous users to `/login` and preserve the attempted route. Role dashboards are:

- `owner -> /dashboard/owner`
- `farmer -> /dashboard/farmer`
- `worker -> /dashboard/worker`
- `admin -> /dashboard/admin`

## Demo Credentials

Run the seed command in development:

```bash
npm run seed --workspace backend
```

Demo-only password for all seeded users:

```text
AgriLink@123
```

Users:

- `owner@agrilink.demo`
- `farmer@agrilink.demo`
- `worker@agrilink.demo`
- `admin@agrilink.demo`

## Security Notes

- Passwords are hashed with bcrypt.
- Refresh tokens are stored only as SHA-256 hashes.
- Access and refresh secrets are separate environment variables.
- Auth endpoints use stricter rate limits.
- Cookies are HTTP-only and configurable for production security.
- Production startup should use strong secrets and `COOKIE_SECURE=true`.
