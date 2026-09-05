# Velvet Pearl Backend

Express API for Velvet Pearl enquiries, admin operations, route estimates, and generated invoice/quotation PDFs.

## Runtime

- Node.js 18+
- Express.js
- MySQL/MariaDB through `mysql2`
- PDF generation through `pdfkit`
- Optional SMTP delivery through `nodemailer`

## Environment

Create `backend/.env` from [`backend/.env.example`](./.env.example).

Minimum local example:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=replace_with_a_long_random_secret
SETUP_SECRET=replace_with_a_long_random_setup_secret
CORS_ORIGIN=http://localhost:5173
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=velvetapp
DB_PASSWORD=replace_me
DB_NAME=velvet_pearl
SERVE_FRONTEND=false
```

Hostinger can also use a URL:

```env
DATABASE_URL=mysql://u000000000_velvetapp:password@localhost:3306/u000000000_velvet
DB_DIALECT=mysql
SERVE_FRONTEND=true
FRONTEND_DIST_PATH=../dist
```

## Database Setup

Initialize a MySQL/MariaDB database once. The bootstrap is idempotent and adds missing tables to a partial schema:

```bash
npm run init-db
```

The schema source is [`backend/utils/schema.mysql.sql`](./utils/schema.mysql.sql). Startup checks the required tables and fails fast when the schema is incomplete.

## Local Commands

```bash
npm install
npm run init-db
npm start
```

From the repository root:

```bash
npm run dev
npm run build
npm run hostinger:start
```

## Production Notes

- Hostinger Node.js should run `backend/server.js`.
- Build the Vite frontend into `dist`.
- Set `SERVE_FRONTEND=true` and `FRONTEND_DIST_PATH=../dist`.
- Configure a map provider key before relying on production autocomplete/directions.
- Configure SMTP before using invoice/quotation email send actions.
