# Backend

The backend is a modular Express application with routes, controllers, services, models, validators, middleware, and Socket.IO handlers. MongoDB/Mongoose provides persistence; Zod validates inputs; access JWTs and rotating opaque refresh tokens provide authentication.

Startup validates environment variables, connects MongoDB, initializes sockets, and supports graceful SIGINT/SIGTERM shutdown. Middleware supplies compression, security headers, explicit CORS, request IDs, bounded parsers, rate limiting, structured errors, and request metrics in logs. `/ready` returns 503 until MongoDB is connected.

Slow provider operations must use existing timeout/fallback services. Background queues and Redis are deliberate future extensions, not runtime requirements for the hackathon deployment.
