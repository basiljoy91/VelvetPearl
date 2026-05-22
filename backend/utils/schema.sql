-- Database Schema for Velvet Pearl Backend

-- The tables below will be created in the database specified in your .env file


-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Will store bcrypt hash
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: To insert the default admin manually:
-- INSERT INTO admins (email, password) VALUES ('admin@velvetpearl.com', '$2b$10$YourBcryptHashHere');

-- 2. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY, -- e.g., VP-1234
    customer VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    service VARCHAR(255) NOT NULL,
    details TEXT,
    schedule VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Cancelled')),
    amount VARCHAR(50) DEFAULT 'TBD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    id VARCHAR(50) PRIMARY KEY, -- e.g., DR-100
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    rating VARCHAR(10) DEFAULT '5.0',
    experience VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
