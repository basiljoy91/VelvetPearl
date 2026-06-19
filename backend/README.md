# Velvet Pearl Backend

This backend now targets the shared Supabase PostgreSQL database used by the team.

## Runtime

- Node.js 18+
- Express.js
- PostgreSQL via `pg`

## Environment

Create `backend/.env` from [`backend/.env.example`](./.env.example).

Example:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=12h
SETUP_SECRET=replace_with_a_long_random_setup_secret
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
DATABASE_URL=postgresql://postgres:replace_me@db.your-project-ref.supabase.co:5432/postgres
DB_SSL=true
SERVE_FRONTEND=true
FRONTEND_DIST_PATH=../dist
```

You can also use separate variables instead of `DATABASE_URL`:

```env
DB_HOST=db.your-project-ref.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=replace_me
DB_NAME=postgres
```

## Local Setup

1. Install frontend dependencies from the project root:

```bash
npm install
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. If you are pointing at a fresh PostgreSQL database, initialize the schema once:

```bash
npm run init-db
```

`npm run init-db` reads the SQL files in [`supabase/migrations`](/Users/basiljoy/VS%20code/roughnote/cabwebsit/supabase/migrations). It skips bootstrap when the expected tables already exist, which is the normal case for the shared team Supabase instance.

4. Start the backend:

```bash
npm start
```

## Important Notes

- The shared schema source of truth is [`supabase/migrations`](/Users/basiljoy/VS%20code/roughnote/cabwebsit/supabase/migrations).
- The backend expects the Supabase schema to exist before startup and will fail fast if required tables are missing.
- The backend can serve the built Vite frontend when `SERVE_FRONTEND=true`.
