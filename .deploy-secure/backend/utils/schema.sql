-- MySQL schema for Velvet Pearl backend

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'admin',
    is_main_admin BOOLEAN NOT NULL DEFAULT FALSE,
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_setup_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token_hash VARCHAR(255) NOT NULL,
    created_by INT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_setup_keys_created_by
        FOREIGN KEY (created_by) REFERENCES admins(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS enquiries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
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
    service_details_json LONGTEXT NOT NULL,
    admin_notes TEXT,
    assigned_driver_id VARCHAR(50),
    assigned_vehicle_id VARCHAR(50),
    assigned_room_id VARCHAR(50),
    assigned_package_id VARCHAR(50),
    assigned_hotel_option VARCHAR(255),
    assigned_owner_id VARCHAR(100),
    quote_amount VARCHAR(100),
    consent_to_contact BOOLEAN NOT NULL DEFAULT TRUE,
    requirement_notes TEXT,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_contacted_at DATETIME,
    follow_up_at DATETIME,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    archived_at DATETIME,
    archived_reason TEXT,
    admin_whatsapp_notification_status VARCHAR(30) NOT NULL DEFAULT 'not_enabled',
    customer_whatsapp_notification_status VARCHAR(30) NOT NULL DEFAULT 'not_enabled',
    whatsapp_error_message TEXT,
    notification_sent_at DATETIME,
    notification_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    notification_error TEXT,
    KEY idx_enquiries_status (status),
    KEY idx_enquiries_type (enquiry_type),
    KEY idx_enquiries_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS enquiry_counters (
    enquiry_type VARCHAR(30) NOT NULL,
    enquiry_year INT NOT NULL,
    last_number INT NOT NULL DEFAULT 0,
    PRIMARY KEY (enquiry_type, enquiry_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback_counters (
    feedback_year INT NOT NULL PRIMARY KEY,
    last_number INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reference_id VARCHAR(30) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    city VARCHAR(120) NOT NULL,
    display_city VARCHAR(120) NOT NULL,
    service_used VARCHAR(80) NOT NULL,
    display_service_used VARCHAR(80) NOT NULL,
    rating TINYINT NOT NULL,
    feedback_message TEXT NOT NULL,
    display_message TEXT NOT NULL,
    contact_number VARCHAR(50),
    email VARCHAR(255),
    trip_month VARCHAR(7),
    publish_consent BOOLEAN NOT NULL DEFAULT FALSE,
    source_page VARCHAR(50),
    status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    admin_notes TEXT,
    approved_at DATETIME,
    declined_at DATETIME,
    approved_by_admin_id INT NULL,
    last_reviewed_by_admin_id INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_feedback_entries_status (status),
    KEY idx_feedback_entries_featured (featured),
    KEY idx_feedback_entries_created_at (created_at),
    KEY idx_feedback_entries_approved_at (approved_at),
    CONSTRAINT fk_feedback_entries_approved_by_admin
        FOREIGN KEY (approved_by_admin_id) REFERENCES admins(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_feedback_entries_last_reviewed_by_admin
        FOREIGN KEY (last_reviewed_by_admin_id) REFERENCES admins(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS drivers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    rating VARCHAR(10) DEFAULT '5.0',
    experience VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    photo TEXT,
    licence_status VARCHAR(50) DEFAULT 'Pending',
    address TEXT,
    notes TEXT,
    assigned_vehicle VARCHAR(50),
    total_rides INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_drivers_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fleet (
    id VARCHAR(50) PRIMARY KEY,
    model VARCHAR(255) NOT NULL,
    plate VARCHAR(50) NOT NULL,
    type VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'Available',
    `lastService` VARCHAR(100),
    photo TEXT,
    age INT DEFAULT 0,
    fuel_status INT DEFAULT 100,
    next_service VARCHAR(100),
    `condition` VARCHAR(50) DEFAULT 'Good',
    notes TEXT,
    insurance_provider VARCHAR(255),
    insurance_policy VARCHAR(100),
    insurance_start DATE,
    insurance_expiry DATE,
    insurance_status VARCHAR(50) DEFAULT 'Unknown',
    insurance_doc TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_fleet_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cab_enquiry_details (
    enquiry_id BIGINT PRIMARY KEY,
    pickup VARCHAR(255),
    dropoff VARCHAR(255),
    passengers INT,
    luggage VARCHAR(255),
    vehicle_preference VARCHAR(255),
    requirement_notes TEXT,
    CONSTRAINT fk_cab_enquiry_details_enquiry
        FOREIGN KEY (enquiry_id) REFERENCES enquiries(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS room_enquiry_details (
    enquiry_id BIGINT PRIMARY KEY,
    check_in DATE,
    check_out DATE,
    guests INT,
    room_count INT,
    room_type VARCHAR(100),
    budget VARCHAR(100),
    preferred_area VARCHAR(255),
    preferred_hotel VARCHAR(255),
    CONSTRAINT fk_room_enquiry_details_enquiry
        FOREIGN KEY (enquiry_id) REFERENCES enquiries(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tour_enquiry_details (
    enquiry_id BIGINT PRIMARY KEY,
    destination VARCHAR(255),
    travel_window_start DATE,
    travel_window_end DATE,
    duration_days INT,
    duration_label VARCHAR(120),
    group_size INT,
    pickup_required VARCHAR(50),
    hotel_preference VARCHAR(255),
    budget VARCHAR(100),
    CONSTRAINT fk_tour_enquiry_details_enquiry
        FOREIGN KEY (enquiry_id) REFERENCES enquiries(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS custom_trip_details (
    enquiry_id BIGINT PRIMARY KEY,
    custom_category VARCHAR(255),
    location VARCHAR(255),
    travel_window_start DATE,
    travel_window_end DATE,
    group_size INT,
    budget VARCHAR(100),
    requirement_notes TEXT,
    CONSTRAINT fk_custom_trip_details_enquiry
        FOREIGN KEY (enquiry_id) REFERENCES enquiries(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS enquiry_audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    enquiry_id BIGINT NOT NULL,
    admin_id INT NULL,
    admin_role VARCHAR(30),
    action_type VARCHAR(50) NOT NULL,
    field_name VARCHAR(80),
    previous_value TEXT,
    next_value TEXT,
    metadata_json LONGTEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_enquiry_audit_log_enquiry_id (enquiry_id),
    CONSTRAINT fk_enquiry_audit_log_enquiry
        FOREIGN KEY (enquiry_id) REFERENCES enquiries(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_enquiry_audit_log_admin
        FOREIGN KEY (admin_id) REFERENCES admins(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
