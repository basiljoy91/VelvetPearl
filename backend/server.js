require('./config/loadEnv');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const db = require('./config/db');
const { getSchemaPresence, ensureRuntimeCompatibility } = require('./utils/schemaSupport');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const adminEnquiryRoutes = require('./routes/adminEnquiryRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const driverRoutes = require('./routes/driverRoutes');
const fleetRoutes = require('./routes/fleetRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const tripRoutes = require('./routes/tripRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
app.disable('x-powered-by');
app.set('trust proxy', 1);
const shouldServeFrontend = String(process.env.SERVE_FRONTEND || '').toLowerCase() === 'true';
const frontendDistPath = process.env.FRONTEND_DIST_PATH
  ? path.resolve(__dirname, process.env.FRONTEND_DIST_PATH)
  : path.resolve(__dirname, '..', 'dist');
const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([
  ...configuredOrigins,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
])];

function getDatabaseTroubleshootingHint(error) {
  const message = String(error?.message || '');
  const host = String(db.connectionSummary?.host || '');

  if (host.includes('pooler.supabase.com') && message.includes('tenant/user') && message.includes('not found')) {
    return 'Supabase pooler tenant/user lookup failed. Re-copy the exact Session pooler connection string from Supabase Dashboard > Connect. The pooler host region and the username `postgres.<project-ref>` must belong to the same project.';
  }

  if (message.toLowerCase().includes('password authentication failed')) {
    return 'Database password was rejected. Reset the database password in Supabase if needed, then update backend/.env.';
  }

  if (message.toLowerCase().includes('connection refused')) {
    return 'Database host is reachable but refused the connection. Verify that the project is running and that you chose the right direct or pooler endpoint.';
  }

  return null;
}

function getNormalizedOriginHost(value = '') {
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return '';
  }
}

function getNormalizedRequestHost(req) {
  return String(req.headers['x-forwarded-host'] || req.headers.host || '')
    .split(',')[0]
    .trim()
    .toLowerCase();
}

// Middleware
app.use(cors((req, callback) => {
  const origin = req.header('Origin');
  const requestHost = getNormalizedRequestHost(req);
  const originHost = getNormalizedOriginHost(origin);
  const isConfiguredOrigin = origin && allowedOrigins.includes(origin);
  const isSameHostOrigin = originHost && requestHost && originHost === requestHost;

  if (!origin || isConfiguredOrigin || isSameHostOrigin) {
    return callback(null, {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
  }

  return callback(new Error(`CORS blocked for origin: ${origin}`));
}));
app.options('*', cors());
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
app.use(express.json({ limit: process.env.REQUEST_BODY_LIMIT || '250kb' }));
app.use(express.urlencoded({ limit: process.env.REQUEST_BODY_LIMIT || '250kb', extended: true }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Velvet Pearl API is running smoothly.' });
});

// API Routes
app.use('/api/admin', authRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/admin/enquiries', adminEnquiryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/admin', analyticsRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/chatbot', chatbotRoutes);

if (shouldServeFrontend) {
  if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath, {
      index: false,
      etag: true,
      maxAge: 0,
      setHeaders(res, servedPath) {
        const lowerPath = servedPath.toLowerCase();

        if (lowerPath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
          return;
        }

        if (process.env.NODE_ENV === 'production') {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          return;
        }

        res.setHeader('Cache-Control', 'no-cache');
      },
    }));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      if (req.method !== 'GET') return next();
      if (!req.accepts('html')) return next();
      return res.sendFile(path.join(frontendDistPath, 'index.html'), {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    });
  } else {
    console.warn(`SERVE_FRONTEND=true but no frontend build was found at ${frontendDistPath}`);
  }
}

// Catch-all 404 for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);

  if (err.message && err.message.startsWith('CORS blocked for origin')) {
    return res.status(403).json({ success: false, message: 'Origin not allowed.' });
  }

  if (res.headersSent) {
    return next(err);
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.expose ? err.message : 'Internal Server Error',
  });
});

async function ensureDatabaseReady() {
  console.log('Preparing database connection using config:', db.connectionSummary);
  await db.query('SELECT 1');

  const schemaPresence = await getSchemaPresence(db);

  if (!schemaPresence.isReady) {
    throw new Error(
      `Supabase schema is missing required tables: ${schemaPresence.missingTables.join(', ')}. `
      + 'Apply the SQL files in supabase/migrations or run `npm run init-db` against a fresh database before starting the server.'
    );
  }

  await ensureRuntimeCompatibility(db);

  await db.query(`UPDATE drivers SET status = 'Unavailable' WHERE status::text = 'Inactive'`);
  await db.query(`UPDATE admins SET role = 'admin' WHERE role IS NULL OR role::text = ''`);
  await db.query(`
    UPDATE admins
    SET is_main_admin = true,
        role = 'main_admin'
    WHERE id = (
      SELECT id
      FROM admins
      ORDER BY id ASC
      LIMIT 1
    )
  `);

  console.log('Database connection and compatibility checks are ready.');
}

async function startServer() {
  try {
    await ensureDatabaseReady();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      if (shouldServeFrontend) {
        console.log(`Serving frontend from ${frontendDistPath}`);
      }
    });
  } catch (error) {
    console.error('Failed to verify the database connection or start the server.');
    console.error('Startup config summary:', {
      port: PORT,
      shouldServeFrontend,
      frontendDistPath,
      database: db.connectionSummary,
    });
    console.error('Startup error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      table: error.table,
      column: error.column,
    });
    const troubleshootingHint = getDatabaseTroubleshootingHint(error);
    if (troubleshootingHint) {
      console.error('Troubleshooting hint:', troubleshootingHint);
    }
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

startServer();
