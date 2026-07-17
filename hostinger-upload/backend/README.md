# Velvet Pearl Backend

This backend now targets **Hostinger MySQL** for production deployment.

## Runtime

- Node.js 18+
- Express.js
- MySQL via `mysql2`

## Environment

Create `backend/.env` from [`backend/.env.example`](./.env.example).

Example:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=replace_with_a_long_random_secret
SETUP_SECRET=replace_with_a_long_random_setup_secret
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
DATABASE_URL=mysql://u123456789_appuser:replace_me@localhost:3306/u123456789_appdb
DB_SSL=false
SERVE_FRONTEND=true
FRONTEND_DIST_PATH=../dist
```

You can also use separate variables instead of `DATABASE_URL`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=u123456789_appuser
DB_PASSWORD=replace_me
DB_NAME=u123456789_appdb
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

3. Initialize the MySQL schema:

```bash
npm run init-db
```

4. Start the backend:

```bash
npm start
```

## Important Notes

- The schema file is [`backend/utils/schema.sql`](./utils/schema.sql).
- The server auto-runs the schema on startup using `CREATE TABLE IF NOT EXISTS`.
- JSON-like payloads are stored as serialized text and parsed in the app layer.
- The backend can serve the built Vite frontend when `SERVE_FRONTEND=true`.

## Production on Hostinger

Use the full deployment walkthrough in:

- [docs/hostinger-production-plan.md](/Users/basiljoy/VS%20code/roughnote/cabwebsit/docs/hostinger-production-plan.md)
