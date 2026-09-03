# Student Task Manager

A small full-stack task manager for students. It demonstrates a Next.js frontend communicating with an Express REST API backed by PostgreSQL on Neon.

## Features

- Account registration and login with bcrypt password hashing
- JWT authentication stored in the browser for the demo workflow
- Create, view, complete, and delete personal tasks
- Due dates, descriptions, priorities, statistics, loading states, errors, and empty states
- Responsive interface for desktop, tablet, and mobile

## Stack and architecture

`Next.js + React + Tailwind CSS` -> `Express REST API` -> `PostgreSQL / Neon`

The frontend never connects to Neon directly. Protected requests send `Authorization: Bearer <token>` to the backend. The backend verifies the token, uses its user ID in parameterized SQL queries, and returns JSON.

## Folder structure

```text
student-task-manager/
  frontend/                 # Next.js App Router application
    app/page.js             # Auth and dashboard UI
    app/globals.css         # Design system and responsive styles
  backend/                  # Express API
    controllers/            # Auth and task request handlers
    middleware/auth.js      # JWT verification
    routes/                 # REST route definitions
    db.js                   # Neon pool and table initialization
    server.js               # Express entry point
  README.md
```

## Local setup

1. Create a free PostgreSQL database at [Neon](https://neon.tech) and copy its connection string.
2. Create `backend/.env` from `backend/.env.example`:

```env
DATABASE_URL=your_neon_connection_string
JWT_SECRET=use_a_long_random_secret
CLIENT_URL=http://localhost:3100
PORT=5100
```

3. Create `frontend/.env.local` from `frontend/.env.local.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5100
```

4. Install dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```

5. Run each service in a separate terminal:

```bash
# terminal 1
cd backend && npm run dev

# terminal 2
cd frontend && npm run dev -- -p 3100
```

The backend creates the `users` and `tasks` tables on startup. Open http://localhost:3100.

## API endpoints

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/` | No | Health check |
| POST | `/api/auth/register` | No | Create an account |
| POST | `/api/auth/login` | No | Return a JWT |
| GET | `/api/tasks` | Yes | List the current user's tasks |
| POST | `/api/tasks` | Yes | Create a task |
| PUT | `/api/tasks/:id` | Yes | Update an owned task |
| DELETE | `/api/tasks/:id` | Yes | Delete an owned task |

## Database

`users` stores `id`, `name`, unique `email`, hashed `password`, and `created_at`. `tasks` stores `id`, `user_id`, `title`, `description`, `due_date`, `priority`, `completed`, and `created_at`. Tasks reference users with `ON DELETE CASCADE`.

## Deployment

### Vercel

Import the repository into Vercel, set the project root to `frontend`, and add `NEXT_PUBLIC_API_URL=https://YOUR-RENDER-SERVICE.onrender.com`. Deploy with the default Next.js settings.

### Render

Create a Web Service from the repository, set the root directory to `backend`, build command to `npm install`, and start command to `npm start`. Add `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL=https://YOUR-VERCEL-APP.vercel.app`, and let Render provide `PORT`.

After both deployments, update `CLIENT_URL` and `NEXT_PUBLIC_API_URL` with the real URLs and redeploy if needed.

## Git and GitHub

```bash
git init
git add .
git commit -m "Build student task manager"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/student-task-manager.git
git push -u origin main
```

Never commit `.env` or `.env.local`; the root `.gitignore` excludes them.

## Demo checklist

Register, log in, show the zero-state dashboard, add a task with priority and due date, mark it complete, delete it, and explain the request flow in browser devtools. Then show the separate `frontend` and `backend` roots, Neon tables, GitHub, Vercel, and Render.

## Future improvements

Add edit-task UI, refresh tokens in secure cookies, pagination, reminders, filtering, and automated API tests.
