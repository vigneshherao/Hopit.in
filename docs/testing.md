# Hackathon test strategy

Run from the repository root:

```sh
npm run lint
npm test --workspace backend
npm test --workspace frontend
npm run build --workspace backend
npm run build --workspace frontend
npm audit --omit=dev
```

The critical smoke path is login, browse/search land, submit an application, owner acceptance, agreement access, AI analyzer fallback, weather fallback, worker booking, chat send/reconnect, notification receipt, and admin moderation approval. Authorization tests should cover suspended users, cross-user land/application/agreement access, non-member chat access, and missing admin permissions.

Backend integration tests use `mongodb-memory-server`; the runtime must permit binding a local port. Tests must never use a development or production database. E2E and load-test scripts are not currently present, so their results must not be inferred from unit/build results.
