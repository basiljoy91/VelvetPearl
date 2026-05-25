# Velvet Pearl Backend Server

This is the Express backend for the Velvet Pearl Premium Travel application. It handles authentication, data persistence via MySQL, and analytics calculations for the admin dashboard.

## Prerequisites

- Node.js (v18+)
- MySQL Server (v8+)

## Setup Instructions

### 1. Database Initialization
1. Ensure your MySQL server is running.
2. Open your MySQL client (e.g., MySQL Workbench, CLI).
3. Execute the `schema.sql` file located in `backend/config/schema.sql` to generate the `velvet_pearl` database and all required tables.
   ```sql
   source /path/to/backend/config/schema.sql;
   ```

### 2. Environment Configuration
Create a `.env` file at the root of the `backend/` directory.

**Important:** Do NOT commit your `.env` file or expose real secrets to source control.

**Example `.env` structure:**
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=velvet_pearl
JWT_SECRET=your_super_secret_jwt_key
SETUP_SECRET=velvet_pearl_setup_2026
```

- `JWT_SECRET`: Used to encrypt session tokens for the admin portal. Use a secure random string.
- `SETUP_SECRET`: A secure passphrase required by the frontend during the First Admin Initialization to prevent unauthorized bootstraps.

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
Server running on port 5000
MySQL Connected!
```

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

## Note: for frontend there is also an .env file