# Velvet Pearl Backend Server

This is the Express backend for the Velvet Pearl Premium Travel application. It handles authentication, data persistence via PostgreSQL, and analytics calculations for the admin dashboard.

## Prerequisites

- Node.js (v18+)
- PostgreSQL (v13+)

## Setup Instructions

### 1. Database Initialization
1. Ensure your PostgreSQL server is running.
2. Create the database if it does not already exist.
3. Apply the schema from [`backend/utils/schema.sql`](./utils/schema.sql).
   ```bash
   psql -U postgres -d velvet_pearl -f backend/utils/schema.sql
   ```

You can also use the bootstrap script after configuring your environment:
```bash
cd backend
npm run init-db
```

### 2. Environment Configuration
Create a `.env` file at the root of the `backend/` directory.

**Important:** Do NOT commit your `.env` file or expose real secrets to source control.

**Example `.env` structure:**
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
SETUP_SECRET=velvet_pearl_setup_2026
CORS_ORIGIN=http://localhost:5173

DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/velvet_pearl
DB_SSL=false

# Optional alternative to DATABASE_URL
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=velvet_pearl
# DB_USER=postgres
# DB_PASSWORD=your_postgres_password
```

- `JWT_SECRET`: Used to encrypt session tokens for the admin portal. Use a secure random string.
- `SETUP_SECRET`: A secure passphrase required by the frontend during the First Admin Initialization to prevent unauthorized bootstraps.
- `CORS_ORIGIN`: Comma-separated list of frontend origins allowed to call the API.
- `DATABASE_URL`: Recommended single-variable PostgreSQL connection string.
- `DB_SSL`: Set to `true` when your PostgreSQL provider requires SSL.

### 3. Install Dependencies
Navigate into the `backend/` directory and install the required Node modules:
```bash
cd backend
npm install
```

### 4. Running the Server
You can start the backend server in development mode using `nodemon` or standard node.
```bash
# Start server in development mode (auto-restarts on changes)
npm run dev

# Start server in production mode
npm start
```

The server should output:
```
Server running on port 5009
```

When running the frontend locally, the Vite dev server proxies `/api` requests to `http://localhost:5009` by default. You can override that with `VITE_PROXY_API_TARGET` or point the frontend directly at a deployed backend with `VITE_API_BASE_URL`.

## Admin Initialization
Because there is no default admin account in the database, you must initialize one through the frontend interface:
1. Ensure both the frontend and backend are running.
2. Navigate to the Admin Portal on the frontend (`/admin`).
3. Click on "First time setup? Initialize System".
4. Enter an email, a strong password, and the `SETUP_SECRET` exactly as configured in your backend `.env` file.
5. Upon successful creation, the system will lock further initializations and redirect you to login.

## API Architecture
- `/api/admin/login` - Authenticates admins via `bcrypt` and returns a JWT.
- `/api/admin/signup` - Creates the first admin (requires `SETUP_SECRET`, limited to 1 user).
- `/api/admin/change-password` - Updates the admin password (requires JWT authentication).
- `/api/admin/analytics` - Computes live statistics (bookings today, utilization, active drivers, etc.).
- `/api/bookings`, `/api/fleet`, `/api/drivers` - Standard CRUD endpoints for operational data.
