# Demo stability

Start MongoDB, copy both `.env.example` files, set unique JWT secrets, seed with `npm run seed --workspace backend`, then start the two workspaces. The seed is intended to provide the stable demo identities and marketplace records described in the existing feature documentation.

Existing provider behavior supports local/demo weather and remote-monitoring data, while AI services expose bounded timeouts and provider-aware errors. `GET /health` reports process health; `GET /ready` returns 503 until MongoDB is connected. The UI retries ordinary queries once, recovers after network reconnect, and times out stalled API requests after 15 seconds.

Do not present provider fallback data as live analysis. A single unified `DEMO_MODE` switch and guaranteed fallback coverage across every AI/disease/email path are not yet implemented; validate each chosen judging path before the event. Keep a pre-seeded local database and approved sample images available.
