require('./config/loadEnv');
const express = require('express');
const cors = require('cors');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const driverRoutes = require('./routes/driverRoutes');
const fleetRoutes = require('./routes/fleetRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const tripRoutes = require('./routes/tripRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json({ limit: '10mb' })); // Parses incoming JSON requests with increased limit for base64 images
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Velvet Pearl API is running smoothly.' });
});

// API Routes
app.use('/api/admin', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/admin', analyticsRoutes);
app.use('/api/trips', tripRoutes);

// Catch-all 404 for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Auto-run DB migrations
  try {
    const db = require('./config/db');
    
    // Admins and Setup Keys Migrations
    await db.query(`
      ALTER TABLE admins
      ADD COLUMN IF NOT EXISTS is_main_admin BOOLEAN DEFAULT false;
    `);
    // Ensure the very first admin is the main admin
    await db.query(`
      UPDATE admins SET is_main_admin = true WHERE id = (SELECT id FROM admins ORDER BY id ASC LIMIT 1) AND is_main_admin = false;
    `);
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_setup_keys (
          id SERIAL PRIMARY KEY,
          token_hash VARCHAR(255) NOT NULL,
          created_by INT REFERENCES admins(id),
          expires_at TIMESTAMP NOT NULL,
          used BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      ALTER TABLE drivers
      ADD COLUMN IF NOT EXISTS photo TEXT,
      ADD COLUMN IF NOT EXISTS licence_status VARCHAR(50) DEFAULT 'Pending',
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS assigned_vehicle VARCHAR(50),
      ADD COLUMN IF NOT EXISTS total_rides INT DEFAULT 0;
    `);
    
    // Auto-run DB migrations for fleet
    await db.query(`
      ALTER TABLE fleet
      ADD COLUMN IF NOT EXISTS photo TEXT,
      ADD COLUMN IF NOT EXISTS age INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS fuel_status INT DEFAULT 100,
      ADD COLUMN IF NOT EXISTS next_service VARCHAR(100),
      ADD COLUMN IF NOT EXISTS condition VARCHAR(50) DEFAULT 'Good',
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS insurance_provider VARCHAR(255),
      ADD COLUMN IF NOT EXISTS insurance_policy VARCHAR(100),
      ADD COLUMN IF NOT EXISTS insurance_start DATE,
      ADD COLUMN IF NOT EXISTS insurance_expiry DATE,
      ADD COLUMN IF NOT EXISTS insurance_status VARCHAR(50) DEFAULT 'Unknown',
      ADD COLUMN IF NOT EXISTS insurance_doc TEXT;
    `);

    // Auto-run DB migrations for driver assignment in bookings
    await db.query(`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS driver_id VARCHAR(50),
      ADD COLUMN IF NOT EXISTS driver_name VARCHAR(255);
    `);

    console.log('Database auto-migrations complete.');
  } catch (e) {
    console.error('Failed to auto-migrate database. (This is fine if columns already exist or if using a different DB)', e.message);
  }
});
