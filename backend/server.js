require('./config/loadEnv');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const db = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const adminEnquiryRoutes = require('./routes/adminEnquiryRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const driverRoutes = require('./routes/driverRoutes');
const fleetRoutes = require('./routes/fleetRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const tripRoutes = require('./routes/tripRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
app.disable('x-powered-by');
app.set('trust proxy', 1);
const shouldServeFrontend = String(process.env.SERVE_FRONTEND || '').toLowerCase() === 'true';
const frontendDistPath = process.env.FRONTEND_DIST_PATH
  ? path.resolve(__dirname, process.env.FRONTEND_DIST_PATH)
  : path.resolve(__dirname, '..', 'dist');
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174,http://localhost:5175')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

if (shouldServeFrontend) {
  if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath, {
      index: false,
      maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
    }));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      if (req.method !== 'GET') return next();
      if (!req.accepts('html')) return next();
      return res.sendFile(path.join(frontendDistPath, 'index.html'));
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
  const schemaPath = path.join(__dirname, 'utils', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  await db.query(schemaSql);
  await db.query(`UPDATE drivers SET status = 'Unavailable' WHERE status = 'Inactive'`);
  await db.query(`UPDATE admins SET role = 'admin' WHERE role IS NULL OR role = ''`);
  await db.query(`
    UPDATE admins
    SET is_main_admin = true, role = 'main_admin'
    ORDER BY id ASC
    LIMIT 1
  `);

  console.log('Database schema and auto-migrations are ready.');
}

async function startServer() {
  try {
    await ensureDatabaseReady();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize the database schema or start the server.', error.message);
    process.exit(1);
  }
}

startServer();
