const { Pool } = require('pg');
require('./backend/config/loadEnv');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS public.quotations (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    pickup_city VARCHAR(255),
    destination VARCHAR(255) NOT NULL,
    travel_date DATE NOT NULL,
    return_date DATE,
    number_of_days INTEGER,
    number_of_adults INTEGER,
    number_of_children INTEGER,
    approximate_budget DECIMAL(10,2),
    vehicle_preference VARCHAR(255),
    hotel_required VARCHAR(10),
    additional_requirements TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    quotation_details JSONB
  );
`;
pool.query(createTableQuery).then(() => {
  console.log('Table created');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
