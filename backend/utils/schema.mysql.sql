SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS admins (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'admin',
  is_main_admin TINYINT(1) NOT NULL DEFAULT 0,
  reset_token VARCHAR(255) NULL,
  reset_token_expiry DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admins_email (email),
  KEY idx_admins_reset_token (reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_setup_keys (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  token_hash VARCHAR(255) NOT NULL,
  created_by BIGINT UNSIGNED NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_admin_setup_keys_lookup (used, expires_at),
  KEY idx_admin_setup_keys_created_by (created_by),
  CONSTRAINT fk_admin_setup_keys_created_by FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fleet (
  id VARCHAR(40) NOT NULL,
  model VARCHAR(160) NOT NULL,
  plate VARCHAR(80) NOT NULL,
  type VARCHAR(80) NOT NULL DEFAULT 'Sedan',
  status VARCHAR(40) NOT NULL DEFAULT 'Available',
  `lastService` DATE NULL,
  photo VARCHAR(500) NULL,
  age INT NOT NULL DEFAULT 0,
  fuel_status INT NOT NULL DEFAULT 100,
  next_service DATE NULL,
  `condition` VARCHAR(60) NOT NULL DEFAULT 'Good',
  notes TEXT NULL,
  insurance_provider VARCHAR(160) NULL,
  insurance_policy VARCHAR(160) NULL,
  insurance_start DATE NULL,
  insurance_expiry DATE NULL,
  insurance_status VARCHAR(60) NOT NULL DEFAULT 'Unknown',
  insurance_doc VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_fleet_plate (plate),
  KEY idx_fleet_status (status),
  KEY idx_fleet_insurance_expiry (insurance_expiry)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS drivers (
  id VARCHAR(40) NOT NULL,
  name VARCHAR(160) NOT NULL,
  phone VARCHAR(40) NOT NULL DEFAULT '',
  rating VARCHAR(20) NOT NULL DEFAULT '5.0',
  experience VARCHAR(80) NOT NULL DEFAULT 'New',
  status VARCHAR(40) NOT NULL DEFAULT 'Active',
  photo VARCHAR(500) NULL,
  licence_status VARCHAR(40) NOT NULL DEFAULT 'Pending',
  address TEXT NULL,
  notes TEXT NULL,
  assigned_vehicle VARCHAR(40) NULL,
  total_rides INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_drivers_status (status),
  KEY idx_drivers_assigned_vehicle (assigned_vehicle),
  CONSTRAINT fk_drivers_assigned_vehicle FOREIGN KEY (assigned_vehicle) REFERENCES fleet(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS enquiry_counters (
  enquiry_type VARCHAR(40) NOT NULL,
  enquiry_year INT NOT NULL,
  last_number INT NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (enquiry_type, enquiry_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS enquiries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reference_id VARCHAR(40) NULL,
  enquiry_type VARCHAR(40) NOT NULL DEFAULT 'general',
  customer_name VARCHAR(160) NOT NULL,
  phone_number VARCHAR(40) NOT NULL,
  whatsapp_number VARCHAR(40) NOT NULL,
  email VARCHAR(255) NULL,
  preferred_contact_method VARCHAR(40) NOT NULL DEFAULT 'whatsapp',
  source_page VARCHAR(80) NULL,
  status VARCHAR(60) NOT NULL DEFAULT 'New',
  priority VARCHAR(40) NOT NULL DEFAULT 'Normal',
  travel_date DATE NULL,
  travel_time TIME NULL,
  service_details_json JSON NULL,
  admin_notes TEXT NULL,
  consent_to_contact TINYINT(1) NOT NULL DEFAULT 1,
  requirement_notes TEXT NULL,
  assigned_driver_id VARCHAR(40) NULL,
  assigned_vehicle_id VARCHAR(40) NULL,
  assigned_room_id VARCHAR(80) NULL,
  assigned_package_id VARCHAR(80) NULL,
  assigned_hotel_option VARCHAR(255) NULL,
  assigned_owner_id VARCHAR(80) NULL,
  quote_amount DECIMAL(12,2) NULL,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_contacted_at DATETIME NULL,
  follow_up_at DATETIME NULL,
  is_archived TINYINT(1) NOT NULL DEFAULT 0,
  archived_at DATETIME NULL,
  archived_reason VARCHAR(255) NULL,
  admin_whatsapp_notification_status VARCHAR(40) NOT NULL DEFAULT 'not_enabled',
  customer_whatsapp_notification_status VARCHAR(40) NOT NULL DEFAULT 'not_enabled',
  whatsapp_error_message TEXT NULL,
  notification_sent_at DATETIME NULL,
  notification_status VARCHAR(40) NOT NULL DEFAULT 'pending',
  notification_error TEXT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_enquiries_reference_id (reference_id),
  KEY idx_enquiries_type_status (enquiry_type, status),
  KEY idx_enquiries_submitted (submitted_at),
  KEY idx_enquiries_travel_date (travel_date),
  KEY idx_enquiries_archived (is_archived),
  KEY idx_enquiries_assigned_driver (assigned_driver_id),
  KEY idx_enquiries_assigned_vehicle (assigned_vehicle_id),
  KEY idx_enquiries_source_page (source_page),
  KEY idx_enquiries_customer_name (customer_name),
  KEY idx_enquiries_phone (phone_number),
  CONSTRAINT fk_enquiries_assigned_driver FOREIGN KEY (assigned_driver_id) REFERENCES drivers(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_enquiries_assigned_vehicle FOREIGN KEY (assigned_vehicle_id) REFERENCES fleet(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS locations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  label VARCHAR(255) NOT NULL,
  address VARCHAR(600) NULL,
  provider VARCHAR(80) NOT NULL DEFAULT 'manual',
  provider_place_id VARCHAR(255) NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  city VARCHAR(120) NULL,
  state VARCHAR(120) NULL,
  country VARCHAR(120) NULL,
  postal_code VARCHAR(30) NULL,
  raw_response_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_locations_provider_place (provider, provider_place_id),
  KEY idx_locations_label (label),
  KEY idx_locations_city_state (city, state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS route_estimates (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pickup_location_id BIGINT UNSIGNED NULL,
  drop_location_id BIGINT UNSIGNED NULL,
  pickup_snapshot_json JSON NULL,
  drop_snapshot_json JSON NULL,
  distance_km DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  duration_minutes INT NOT NULL DEFAULT 0,
  route_polyline LONGTEXT NULL,
  geometry_json JSON NULL,
  provider VARCHAR(80) NOT NULL DEFAULT 'fallback',
  raw_response_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_route_estimates_pickup_drop (pickup_location_id, drop_location_id),
  CONSTRAINT fk_route_estimates_pickup FOREIGN KEY (pickup_location_id) REFERENCES locations(id) ON DELETE SET NULL,
  CONSTRAINT fk_route_estimates_drop FOREIGN KEY (drop_location_id) REFERENCES locations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS popular_routes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  pickup_location_id BIGINT UNSIGNED NULL,
  drop_location_id BIGINT UNSIGNED NULL,
  pickup_snapshot_json JSON NULL,
  drop_snapshot_json JSON NULL,
  distance_km DECIMAL(10,2) NULL,
  duration_minutes INT NULL,
  vehicle_type VARCHAR(120) NULL,
  pricing_note VARCHAR(255) NULL,
  route_estimate_id BIGINT UNSIGNED NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_popular_routes_slug (slug),
  KEY idx_popular_routes_active_sort (is_active, sort_order),
  CONSTRAINT fk_popular_routes_pickup FOREIGN KEY (pickup_location_id) REFERENCES locations(id) ON DELETE SET NULL,
  CONSTRAINT fk_popular_routes_drop FOREIGN KEY (drop_location_id) REFERENCES locations(id) ON DELETE SET NULL,
  CONSTRAINT fk_popular_routes_estimate FOREIGN KEY (route_estimate_id) REFERENCES route_estimates(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cab_enquiry_details (
  enquiry_id BIGINT UNSIGNED NOT NULL,
  pickup VARCHAR(255) NULL,
  dropoff VARCHAR(255) NULL,
  pickup_location_id BIGINT UNSIGNED NULL,
  drop_location_id BIGINT UNSIGNED NULL,
  pickup_location_json JSON NULL,
  drop_location_json JSON NULL,
  route_estimate_json JSON NULL,
  passengers VARCHAR(40) NULL,
  luggage VARCHAR(160) NULL,
  vehicle_preference VARCHAR(120) NULL,
  requirement_notes TEXT NULL,
  PRIMARY KEY (enquiry_id),
  CONSTRAINT fk_cab_details_enquiry FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE,
  CONSTRAINT fk_cab_details_pickup FOREIGN KEY (pickup_location_id) REFERENCES locations(id) ON DELETE SET NULL,
  CONSTRAINT fk_cab_details_drop FOREIGN KEY (drop_location_id) REFERENCES locations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS room_enquiry_details (
  enquiry_id BIGINT UNSIGNED NOT NULL,
  check_in DATE NULL,
  check_out DATE NULL,
  guests VARCHAR(40) NULL,
  room_count VARCHAR(40) NULL,
  room_type VARCHAR(120) NULL,
  budget VARCHAR(120) NULL,
  preferred_area VARCHAR(255) NULL,
  preferred_hotel VARCHAR(255) NULL,
  PRIMARY KEY (enquiry_id),
  CONSTRAINT fk_room_details_enquiry FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tour_enquiry_details (
  enquiry_id BIGINT UNSIGNED NOT NULL,
  destination VARCHAR(255) NULL,
  travel_window_start DATE NULL,
  travel_window_end DATE NULL,
  duration_days INT NULL,
  group_size VARCHAR(40) NULL,
  pickup_required VARCHAR(60) NULL,
  hotel_preference VARCHAR(120) NULL,
  budget VARCHAR(120) NULL,
  PRIMARY KEY (enquiry_id),
  CONSTRAINT fk_tour_details_enquiry FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS custom_trip_details (
  enquiry_id BIGINT UNSIGNED NOT NULL,
  custom_category VARCHAR(120) NULL,
  location VARCHAR(255) NULL,
  travel_window_start DATE NULL,
  travel_window_end DATE NULL,
  group_size VARCHAR(40) NULL,
  budget VARCHAR(120) NULL,
  requirement_notes TEXT NULL,
  PRIMARY KEY (enquiry_id),
  CONSTRAINT fk_custom_details_enquiry FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS enquiry_audit_log (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  enquiry_id BIGINT UNSIGNED NOT NULL,
  admin_id BIGINT UNSIGNED NULL,
  admin_role VARCHAR(40) NULL,
  action_type VARCHAR(80) NOT NULL,
  field_name VARCHAR(120) NULL,
  previous_value TEXT NULL,
  next_value TEXT NULL,
  metadata_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_enquiry_audit_log_enquiry (enquiry_id, created_at),
  KEY idx_enquiry_audit_log_admin (admin_id, created_at),
  CONSTRAINT fk_enquiry_audit_log_enquiry FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE,
  CONSTRAINT fk_enquiry_audit_log_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS document_counters (
  document_type VARCHAR(40) NOT NULL,
  document_year INT NOT NULL,
  last_number INT NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (document_type, document_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  invoice_number VARCHAR(60) NOT NULL,
  enquiry_id BIGINT UNSIGNED NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'draft',
  invoice_date DATE NOT NULL,
  due_date DATE NULL,
  customer_name VARCHAR(180) NOT NULL,
  customer_phone VARCHAR(40) NULL,
  customer_email VARCHAR(255) NULL,
  customer_address TEXT NULL,
  booking_reference VARCHAR(80) NULL,
  pickup VARCHAR(255) NULL,
  dropoff VARCHAR(255) NULL,
  trip_details TEXT NULL,
  vehicle_details VARCHAR(255) NULL,
  driver_details VARCHAR(255) NULL,
  service_details_json JSON NULL,
  tax_rows_json JSON NULL,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  additional_charges_json JSON NULL,
  subtotal_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  payment_status VARCHAR(40) NOT NULL DEFAULT 'unpaid',
  notes TEXT NULL,
  terms TEXT NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_invoices_number (invoice_number),
  KEY idx_invoices_status (status),
  KEY idx_invoices_date (invoice_date),
  KEY idx_invoices_enquiry (enquiry_id),
  CONSTRAINT fk_invoices_enquiry FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE SET NULL,
  CONSTRAINT fk_invoices_created_by FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS invoice_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  invoice_id BIGINT UNSIGNED NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tax_rate DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_invoice_items_invoice (invoice_id, sort_order),
  CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS quotations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  quote_number VARCHAR(60) NOT NULL,
  enquiry_id BIGINT UNSIGNED NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'draft',
  quote_date DATE NOT NULL,
  valid_until DATE NULL,
  client_name VARCHAR(180) NOT NULL,
  client_phone VARCHAR(40) NULL,
  client_email VARCHAR(255) NULL,
  client_address TEXT NULL,
  subject VARCHAR(255) NULL,
  pickup VARCHAR(255) NULL,
  dropoff VARCHAR(255) NULL,
  service_summary TEXT NULL,
  vehicle_type VARCHAR(120) NULL,
  subtotal_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_in_words VARCHAR(500) NULL,
  terms TEXT NULL,
  notes TEXT NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_quotations_number (quote_number),
  KEY idx_quotations_status (status),
  KEY idx_quotations_date (quote_date),
  KEY idx_quotations_enquiry (enquiry_id),
  CONSTRAINT fk_quotations_enquiry FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE SET NULL,
  CONSTRAINT fk_quotations_created_by FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS quotation_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  quotation_id BIGINT UNSIGNED NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tax_rate DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_quotation_items_quotation (quotation_id, sort_order),
  CONSTRAINT fk_quotation_items_quotation FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS generated_documents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  document_type VARCHAR(40) NOT NULL,
  document_id BIGINT UNSIGNED NOT NULL,
  document_number VARCHAR(80) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(700) NOT NULL,
  mime_type VARCHAR(120) NOT NULL DEFAULT 'application/pdf',
  file_size BIGINT UNSIGNED NULL,
  public_token VARCHAR(80) NULL,
  public_url VARCHAR(700) NULL,
  generated_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_generated_documents_token (public_token),
  KEY idx_generated_documents_doc (document_type, document_id, created_at),
  CONSTRAINT fk_generated_documents_generated_by FOREIGN KEY (generated_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS document_delivery_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  document_type VARCHAR(40) NOT NULL,
  document_id BIGINT UNSIGNED NOT NULL,
  document_number VARCHAR(80) NOT NULL,
  delivery_method VARCHAR(40) NOT NULL,
  recipient VARCHAR(255) NULL,
  status VARCHAR(40) NOT NULL,
  message TEXT NULL,
  metadata_json JSON NULL,
  performed_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_document_delivery_logs_doc (document_type, document_id, created_at),
  KEY idx_document_delivery_logs_method (delivery_method, status),
  CONSTRAINT fk_document_delivery_logs_performed_by FOREIGN KEY (performed_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO locations (label, address, provider, provider_place_id, latitude, longitude, city, state, country)
VALUES
  ('Chennai', 'Chennai, Tamil Nadu, India', 'seed', 'seed-chennai', 13.0827000, 80.2707000, 'Chennai', 'Tamil Nadu', 'India'),
  ('Pondicherry', 'Puducherry, India', 'seed', 'seed-pondicherry', 11.9416000, 79.8083000, 'Puducherry', 'Puducherry', 'India'),
  ('Coimbatore', 'Coimbatore, Tamil Nadu, India', 'seed', 'seed-coimbatore', 11.0168000, 76.9558000, 'Coimbatore', 'Tamil Nadu', 'India'),
  ('Ooty', 'Udhagamandalam, Tamil Nadu, India', 'seed', 'seed-ooty', 11.4064000, 76.6932000, 'Ooty', 'Tamil Nadu', 'India'),
  ('Madurai', 'Madurai, Tamil Nadu, India', 'seed', 'seed-madurai', 9.9252000, 78.1198000, 'Madurai', 'Tamil Nadu', 'India'),
  ('Kodaikanal', 'Kodaikanal, Tamil Nadu, India', 'seed', 'seed-kodaikanal', 10.2381000, 77.4892000, 'Kodaikanal', 'Tamil Nadu', 'India');

INSERT IGNORE INTO popular_routes (
  title,
  slug,
  pickup_location_id,
  drop_location_id,
  pickup_snapshot_json,
  drop_snapshot_json,
  distance_km,
  duration_minutes,
  vehicle_type,
  pricing_note,
  sort_order
)
SELECT
  'Chennai to Pondicherry',
  'chennai-to-pondicherry',
  p.id,
  d.id,
  JSON_OBJECT('label', p.label, 'address', p.address, 'provider', p.provider, 'provider_place_id', p.provider_place_id, 'latitude', p.latitude, 'longitude', p.longitude, 'city', p.city, 'state', p.state, 'country', p.country),
  JSON_OBJECT('label', d.label, 'address', d.address, 'provider', d.provider, 'provider_place_id', d.provider_place_id, 'latitude', d.latitude, 'longitude', d.longitude, 'city', d.city, 'state', d.state, 'country', d.country),
  155.00,
  195,
  'Executive Sedan',
  'Final fare is shared after route and timing review.',
  10
FROM locations p
JOIN locations d ON d.provider_place_id = 'seed-pondicherry'
WHERE p.provider_place_id = 'seed-chennai';

INSERT IGNORE INTO popular_routes (
  title,
  slug,
  pickup_location_id,
  drop_location_id,
  pickup_snapshot_json,
  drop_snapshot_json,
  distance_km,
  duration_minutes,
  vehicle_type,
  pricing_note,
  sort_order
)
SELECT
  'Coimbatore to Ooty',
  'coimbatore-to-ooty',
  p.id,
  d.id,
  JSON_OBJECT('label', p.label, 'address', p.address, 'provider', p.provider, 'provider_place_id', p.provider_place_id, 'latitude', p.latitude, 'longitude', p.longitude, 'city', p.city, 'state', p.state, 'country', p.country),
  JSON_OBJECT('label', d.label, 'address', d.address, 'provider', d.provider, 'provider_place_id', d.provider_place_id, 'latitude', d.latitude, 'longitude', d.longitude, 'city', d.city, 'state', d.state, 'country', d.country),
  86.00,
  165,
  'Premium SUV',
  'Hill routes are confirmed manually based on vehicle availability.',
  20
FROM locations p
JOIN locations d ON d.provider_place_id = 'seed-ooty'
WHERE p.provider_place_id = 'seed-coimbatore';

INSERT IGNORE INTO popular_routes (
  title,
  slug,
  pickup_location_id,
  drop_location_id,
  pickup_snapshot_json,
  drop_snapshot_json,
  distance_km,
  duration_minutes,
  vehicle_type,
  pricing_note,
  sort_order
)
SELECT
  'Madurai to Kodaikanal',
  'madurai-to-kodaikanal',
  p.id,
  d.id,
  JSON_OBJECT('label', p.label, 'address', p.address, 'provider', p.provider, 'provider_place_id', p.provider_place_id, 'latitude', p.latitude, 'longitude', p.longitude, 'city', p.city, 'state', p.state, 'country', p.country),
  JSON_OBJECT('label', d.label, 'address', d.address, 'provider', d.provider, 'provider_place_id', d.provider_place_id, 'latitude', d.latitude, 'longitude', d.longitude, 'city', d.city, 'state', d.state, 'country', d.country),
  115.00,
  210,
  'SUV or Tempo Traveller',
  'Final quote depends on date, pickup point, and passenger count.',
  30
FROM locations p
JOIN locations d ON d.provider_place_id = 'seed-kodaikanal'
WHERE p.provider_place_id = 'seed-madurai';

SET FOREIGN_KEY_CHECKS = 1;
