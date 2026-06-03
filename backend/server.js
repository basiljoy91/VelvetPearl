require('./config/loadEnv');
const express = require('express');
const cors = require('cors');

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
    await db.query(`
      ALTER TABLE admins
      ADD COLUMN IF NOT EXISTS role VARCHAR(30) NOT NULL DEFAULT 'admin';
    `);
    // Ensure the very first admin is the main admin
    await db.query(`
      UPDATE admins
      SET is_main_admin = true, role = 'main_admin'
      WHERE id = (SELECT id FROM admins ORDER BY id ASC LIMIT 1) AND is_main_admin = false;
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

    await db.query(`
      UPDATE drivers
      SET status = 'Unavailable'
      WHERE status = 'Inactive';
    `);

    await db.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE constraint_schema = current_schema()
            AND table_name = 'drivers'
            AND constraint_name = 'drivers_status_check'
        ) THEN
          ALTER TABLE drivers DROP CONSTRAINT drivers_status_check;
        END IF;

        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE constraint_schema = current_schema()
            AND table_name = 'drivers'
            AND constraint_name = 'drivers_status_check'
        ) THEN
          ALTER TABLE drivers
          ADD CONSTRAINT drivers_status_check
          CHECK (status IN ('Active', 'Unavailable'));
        END IF;
      END $$;
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

    // Core enquiry tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id BIGSERIAL PRIMARY KEY,
        reference_id VARCHAR(30) NOT NULL UNIQUE,
        enquiry_type VARCHAR(30) NOT NULL DEFAULT 'general',
        customer_name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(50) NOT NULL,
        whatsapp_number VARCHAR(50),
        email VARCHAR(255),
        preferred_contact_method VARCHAR(30) NOT NULL DEFAULT 'whatsapp',
        source_page VARCHAR(50),
        status VARCHAR(30) NOT NULL DEFAULT 'New',
        priority VARCHAR(20) NOT NULL DEFAULT 'Normal',
        travel_date DATE,
        travel_time VARCHAR(20),
        service_details_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        admin_notes TEXT,
        assigned_driver_id VARCHAR(50),
        assigned_vehicle_id VARCHAR(50),
        assigned_room_id VARCHAR(50),
        assigned_package_id VARCHAR(50),
        assigned_hotel_option VARCHAR(255),
        assigned_owner_id VARCHAR(100),
        quote_amount VARCHAR(100),
        consent_to_contact BOOLEAN NOT NULL DEFAULT true,
        requirement_notes TEXT,
        submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_contacted_at TIMESTAMP,
        follow_up_at TIMESTAMP,
        is_archived BOOLEAN NOT NULL DEFAULT false,
        archived_at TIMESTAMP,
        archived_reason TEXT,
        admin_whatsapp_notification_status VARCHAR(30) NOT NULL DEFAULT 'not_enabled',
        customer_whatsapp_notification_status VARCHAR(30) NOT NULL DEFAULT 'not_enabled',
        whatsapp_error_message TEXT,
        notification_sent_at TIMESTAMP,
        notification_status VARCHAR(30) NOT NULL DEFAULT 'pending',
        notification_error TEXT
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS enquiry_counters (
        enquiry_type VARCHAR(30) NOT NULL,
        enquiry_year INTEGER NOT NULL,
        last_number INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (enquiry_type, enquiry_year)
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS cab_enquiry_details (
        enquiry_id BIGINT PRIMARY KEY REFERENCES enquiries(id) ON DELETE CASCADE,
        pickup VARCHAR(255),
        dropoff VARCHAR(255),
        passengers INTEGER,
        luggage VARCHAR(255),
        vehicle_preference VARCHAR(255),
        requirement_notes TEXT
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS room_enquiry_details (
        enquiry_id BIGINT PRIMARY KEY REFERENCES enquiries(id) ON DELETE CASCADE,
        check_in DATE,
        check_out DATE,
        guests INTEGER,
        room_count INTEGER,
        room_type VARCHAR(100),
        budget VARCHAR(100),
        preferred_area VARCHAR(255),
        preferred_hotel VARCHAR(255)
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS tour_enquiry_details (
        enquiry_id BIGINT PRIMARY KEY REFERENCES enquiries(id) ON DELETE CASCADE,
        destination VARCHAR(255),
        travel_window_start DATE,
        travel_window_end DATE,
        duration_days INTEGER,
        duration_label VARCHAR(120),
        group_size INTEGER,
        pickup_required VARCHAR(50),
        hotel_preference VARCHAR(255),
        budget VARCHAR(100)
      );
    `);

    await db.query(`
      ALTER TABLE tour_enquiry_details
      ADD COLUMN IF NOT EXISTS duration_label VARCHAR(120);
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS custom_trip_details (
        enquiry_id BIGINT PRIMARY KEY REFERENCES enquiries(id) ON DELETE CASCADE,
        custom_category VARCHAR(255),
        location VARCHAR(255),
        travel_window_start DATE,
        travel_window_end DATE,
        group_size INTEGER,
        budget VARCHAR(100),
        requirement_notes TEXT
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS enquiry_audit_log (
        id BIGSERIAL PRIMARY KEY,
        enquiry_id BIGINT NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
        admin_id INT REFERENCES admins(id),
        admin_role VARCHAR(30),
        action_type VARCHAR(50) NOT NULL,
        field_name VARCHAR(80),
        previous_value TEXT,
        next_value TEXT,
        metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      ALTER TABLE enquiries
      ADD COLUMN IF NOT EXISTS follow_up_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS assigned_hotel_option VARCHAR(255),
      ADD COLUMN IF NOT EXISTS assigned_owner_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS consent_to_contact BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS archived_reason TEXT,
      ADD COLUMN IF NOT EXISTS admin_whatsapp_notification_status VARCHAR(30) NOT NULL DEFAULT 'not_enabled',
      ADD COLUMN IF NOT EXISTS customer_whatsapp_notification_status VARCHAR(30) NOT NULL DEFAULT 'not_enabled',
      ADD COLUMN IF NOT EXISTS whatsapp_error_message TEXT,
      ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS notification_status VARCHAR(30) NOT NULL DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS notification_error TEXT;
    `);

    await db.query(`
      DO $$
      DECLARE
        status_constraint TEXT;
      BEGIN
        SELECT con.conname INTO status_constraint
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        WHERE rel.relname = 'enquiries'
          AND con.contype = 'c'
          AND pg_get_constraintdef(con.oid) ILIKE '%status%';

        IF status_constraint IS NOT NULL THEN
          EXECUTE 'ALTER TABLE enquiries DROP CONSTRAINT ' || quote_ident(status_constraint);
        END IF;

        ALTER TABLE enquiries
        ADD CONSTRAINT enquiries_status_check
        CHECK (status IN ('New', 'Contacted', 'Quoted', 'Awaiting Customer', 'Assigned', 'Confirmed', 'Completed', 'Rejected', 'Cancelled'));
      END $$;
    `);

    await db.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = 'bookings'
        ) THEN
          ALTER TABLE bookings
          ADD COLUMN IF NOT EXISTS email VARCHAR(255),
          ADD COLUMN IF NOT EXISTS service_type VARCHAR(50) DEFAULT 'general',
          ADD COLUMN IF NOT EXISTS source_page VARCHAR(50),
          ADD COLUMN IF NOT EXISTS travel_date DATE,
          ADD COLUMN IF NOT EXISTS travel_time VARCHAR(20),
          ADD COLUMN IF NOT EXISTS admin_notes TEXT,
          ADD COLUMN IF NOT EXISTS enquiry_details JSONB DEFAULT '{}'::jsonb,
          ADD COLUMN IF NOT EXISTS driver_id VARCHAR(50);

          INSERT INTO enquiries (
            reference_id,
            enquiry_type,
            customer_name,
            phone_number,
            whatsapp_number,
            email,
            preferred_contact_method,
            source_page,
            status,
            priority,
            travel_date,
            travel_time,
            service_details_json,
            admin_notes,
            assigned_driver_id,
            quote_amount,
            requirement_notes,
            submitted_at,
            updated_at
          )
          SELECT
            CASE
              WHEN COALESCE(NULLIF(LOWER(COALESCE(service_type, SPLIT_PART(service, ':', 1))), ''), 'general') = 'cab'
                THEN 'CAB-LEGACY-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at, id)::TEXT, 4, '0')
              WHEN COALESCE(NULLIF(LOWER(COALESCE(service_type, SPLIT_PART(service, ':', 1))), ''), 'general') = 'room'
                THEN 'ROOM-LEGACY-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at, id)::TEXT, 4, '0')
              WHEN COALESCE(NULLIF(LOWER(COALESCE(service_type, SPLIT_PART(service, ':', 1))), ''), 'general') = 'tour'
                THEN 'TOUR-LEGACY-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at, id)::TEXT, 4, '0')
              ELSE 'CUSTOM-LEGACY-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at, id)::TEXT, 4, '0')
            END,
            CASE
              WHEN COALESCE(NULLIF(LOWER(COALESCE(service_type, SPLIT_PART(service, ':', 1))), ''), 'general') IN ('cab', 'room', 'tour', 'general')
                THEN COALESCE(NULLIF(LOWER(COALESCE(service_type, SPLIT_PART(service, ':', 1))), ''), 'general')
              ELSE 'custom'
            END,
            customer,
            COALESCE(phone, ''),
            COALESCE(phone, ''),
            email,
            'whatsapp',
            source_page,
            CASE
              WHEN status = 'Pending' THEN 'New'
              WHEN status = 'Under Review' THEN 'Contacted'
              WHEN status = 'Closed' THEN 'Completed'
              WHEN status IN ('New', 'Contacted', 'Quoted', 'Awaiting Customer', 'Assigned', 'Confirmed', 'Completed', 'Rejected', 'Cancelled') THEN status
              ELSE 'New'
            END,
            'Normal',
            travel_date,
            travel_time,
            COALESCE(enquiry_details, '{}'::jsonb),
            admin_notes,
            driver_id,
            amount,
            COALESCE(details, service),
            created_at,
            CURRENT_TIMESTAMP
          FROM bookings b
          WHERE NOT EXISTS (
            SELECT 1
            FROM enquiries e
            WHERE e.requirement_notes = COALESCE(b.details, b.service)
              AND e.customer_name = b.customer
              AND e.phone_number = COALESCE(b.phone, '')
          );
        END IF;
      END $$;
    `);

    console.log('Database auto-migrations complete.');
  } catch (e) {
    console.error('Failed to auto-migrate database. (This is fine if columns already exist or if using a different DB)', e.message);
  }
});
