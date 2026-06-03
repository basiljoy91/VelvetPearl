-- Database Schema for Velvet Pearl Backend

-- The tables below will be created in the database specified in your .env file


-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Will store bcrypt hash
    role VARCHAR(30) NOT NULL DEFAULT 'admin',
    is_main_admin BOOLEAN DEFAULT false,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: To insert the default admin manually:
-- INSERT INTO admins (email, password) VALUES ('admin@velvetpearl.com', '$2b$10$YourBcryptHashHere');

-- 2. Enquiries Table
CREATE TABLE IF NOT EXISTS enquiries (
    id BIGSERIAL PRIMARY KEY,
    reference_id VARCHAR(30) NOT NULL UNIQUE, -- e.g., CAB-2026-0001
    enquiry_type VARCHAR(30) NOT NULL CHECK (enquiry_type IN ('cab', 'room', 'tour', 'custom', 'general')),
    customer_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    whatsapp_number VARCHAR(50),
    email VARCHAR(255),
    preferred_contact_method VARCHAR(30) NOT NULL DEFAULT 'whatsapp',
    source_page VARCHAR(50),
    status VARCHAR(30) NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Quoted', 'Awaiting Customer', 'Assigned', 'Confirmed', 'Completed', 'Rejected', 'Cancelled')),
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
    follow_up_at TIMESTAMP
);
ALTER TABLE enquiries
    ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS archived_reason TEXT,
    ADD COLUMN IF NOT EXISTS admin_whatsapp_notification_status VARCHAR(30) NOT NULL DEFAULT 'not_enabled',
    ADD COLUMN IF NOT EXISTS customer_whatsapp_notification_status VARCHAR(30) NOT NULL DEFAULT 'not_enabled',
    ADD COLUMN IF NOT EXISTS whatsapp_error_message TEXT,
    ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS notification_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS notification_error TEXT;

CREATE TABLE IF NOT EXISTS enquiry_counters (
    enquiry_type VARCHAR(30) NOT NULL,
    enquiry_year INTEGER NOT NULL,
    last_number INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (enquiry_type, enquiry_year)
);

CREATE TABLE IF NOT EXISTS cab_enquiry_details (
    enquiry_id BIGINT PRIMARY KEY REFERENCES enquiries(id) ON DELETE CASCADE,
    pickup VARCHAR(255),
    dropoff VARCHAR(255),
    passengers INTEGER,
    luggage VARCHAR(255),
    vehicle_preference VARCHAR(255),
    requirement_notes TEXT
);

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
ALTER TABLE tour_enquiry_details
    ADD COLUMN IF NOT EXISTS duration_label VARCHAR(120);

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

-- 3. Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    id VARCHAR(50) PRIMARY KEY, -- e.g., DR-100
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    rating VARCHAR(10) DEFAULT '5.0',
    experience VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Unavailable')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
UPDATE drivers
SET status = 'Unavailable'
WHERE status = 'Inactive';

-- 4. Fleet Table
CREATE TABLE IF NOT EXISTS fleet (
    id VARCHAR(50) PRIMARY KEY, -- e.g., FL-100
    model VARCHAR(255) NOT NULL,
    plate VARCHAR(50) NOT NULL,
    type VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'On Trip', 'Maintenance')),
    "lastService" VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
