# Deployment

## Container deployment

Copy `.env.example` to `.env`, replace both JWT secrets, then run:

```sh
docker compose build
docker compose up -d
docker compose exec backend npm run seed --workspace backend
curl http://localhost:8080/healthz
curl http://localhost:8080/ready
```

The frontend container serves the SPA through Nginx and proxies `/api` and `/socket.io` to the backend. MongoDB uses a named volume. Redis is optional: `docker compose --profile redis up -d` starts the Redis-ready service, but the application does not require it.

## Managed deployment

- Vercel/Netlify: root `frontend`, build `npm run build`, output `dist`, set `VITE_API_BASE_URL` to the HTTPS API URL.
- Render/Railway: root repository, build `npm ci && npm run build --workspace backend`, start `npm start --workspace backend`, health path `/ready`.
- Cloud Run/ECS/Azure/EC2/DigitalOcean: build the `backend` and `frontend` Docker targets and place both behind TLS. Persist uploads externally if local storage is enabled.
- MongoDB Atlas: create a least-privilege application user, restrict network access, enable backups, and use the SRV connection string as `MONGODB_URI`.

Production requires unique high-entropy JWT secrets, HTTPS, secure cookies, explicit origins, and a non-development database. Store secrets in the hosting provider’s secret manager, never the repository.

## Scaling, backup, and rollback

Keep the API stateless; use shared object storage for uploads and Redis when multiple socket/API instances are introduced. Back up MongoDB daily with point-in-time recovery where available, enable object-storage versioning, and store encrypted environment exports separately. Test restore quarterly.

Deploy immutable image tags. Roll back by routing traffic to the previous frontend/backend image; restore the database only for destructive schema/data migrations. Take a snapshot before migrations and keep migrations backward compatible during the rollout window.
