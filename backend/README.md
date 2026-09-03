# Student Task Manager API

Express and PostgreSQL backend for the Student Task Manager. Copy `.env.example` to `.env`, set a Neon `DATABASE_URL` and `JWT_SECRET`, then run `npm install` and `npm run dev`.

The server initializes the `users` and `tasks` tables, exposes JSON REST endpoints, hashes passwords with bcryptjs, and protects task routes with JWT middleware. `CLIENT_URL` controls CORS.
