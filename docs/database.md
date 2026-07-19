# Database

MongoDB collections cover users and sessions, lands and moderation, applications and agreements, workers and bookings, farm plans/tasks, AI/weather/disease records, chat, notifications/activity, monitoring, and admin audit data. Models define ownership fields and indexes close to each schema.

Use `npm run seed --workspace backend` only against development/demo databases unless `ALLOW_PRODUCTION_SEED=true` is deliberately set. The seed is idempotent by stable emails, slugs, and seed metadata, but it is representative demo data rather than the requested synthetic 100/50/20 volume benchmark.

For production, use Atlas backups or scheduled `mongodump`, encrypted storage, least-privilege users, TLS, and restore drills. Review new compound indexes with representative `explain('executionStats')` output and avoid unbounded queries/populates.
