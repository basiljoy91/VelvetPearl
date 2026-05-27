require('./loadEnv');
const { Pool } = require('pg');

const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL
    }
  : {
      host: process.env.DB_HOST || process.env.PGHOST,
      user: process.env.DB_USER || process.env.PGUSER,
      password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
      database: process.env.DB_NAME || process.env.PGDATABASE,
      port: Number(process.env.DB_PORT || process.env.PGPORT || 5432)
    };

const shouldUseSsl =
  process.env.DB_SSL === 'true' ||
  (process.env.DATABASE_URL && process.env.DB_SSL !== 'false');

if (shouldUseSsl) {
  connectionConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool({
  ...connectionConfig,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

module.exports = pool;
