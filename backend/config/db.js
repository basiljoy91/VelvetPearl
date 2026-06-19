require('./loadEnv');
const { Pool } = require('pg');

const parseDatabaseUrl = (value) => {
  const url = new URL(value);

  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error(`Unsupported database protocol: ${url.protocol}`);
  }

  return {
    host: url.hostname,
    port: Number(url.port || 5432),
    user: decodeURIComponent(url.username),
    database: decodeURIComponent(url.pathname.replace(/^\//, '')),
  };
};

const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
    }
  : {
      host: process.env.DB_HOST || process.env.PGHOST || '127.0.0.1',
      user: process.env.DB_USER || process.env.PGUSER,
      password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
      database: process.env.DB_NAME || process.env.PGDATABASE,
      port: Number(process.env.DB_PORT || process.env.PGPORT || 5432),
    };

const shouldUseSsl =
  String(process.env.DB_SSL || '').toLowerCase() === 'true' ||
  (process.env.DATABASE_URL && String(process.env.DB_SSL || '').toLowerCase() !== 'false');

if (shouldUseSsl) {
  connectionConfig.ssl = { rejectUnauthorized: false };
}

const parsedUrlSummary = process.env.DATABASE_URL ? parseDatabaseUrl(process.env.DATABASE_URL) : null;

const connectionSummary = {
  source: process.env.DATABASE_URL ? 'DATABASE_URL' : 'DB_* / PG*',
  host: parsedUrlSummary?.host || connectionConfig.host || '(missing)',
  port: parsedUrlSummary?.port || connectionConfig.port || 5432,
  user: parsedUrlSummary?.user || connectionConfig.user || '(missing)',
  database: parsedUrlSummary?.database || connectionConfig.database || '(missing)',
  ssl: Boolean(connectionConfig.ssl),
};

const validateConnectionConfig = () => {
  if (!process.env.DATABASE_URL && !connectionConfig.user) {
    throw new Error('Database user is missing. Set DATABASE_URL or DB_USER / PGUSER.');
  }

  if (!process.env.DATABASE_URL && !connectionConfig.database) {
    throw new Error('Database name is missing. Set DATABASE_URL or DB_NAME / PGDATABASE.');
  }
};

validateConnectionConfig();

const pool = new Pool({
  ...connectionConfig,
  max: Number(process.env.DB_POOL_LIMIT || 10),
  idleTimeoutMillis: 30000,
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

const wrapConnection = (connection) => ({
  query: (sql, params = []) => connection.query(sql, params),
  beginTransaction: () => connection.query('BEGIN'),
  commit: () => connection.query('COMMIT'),
  rollback: () => connection.query('ROLLBACK'),
  release: () => connection.release(),
});

module.exports = {
  query: (sql, params = []) => pool.query(sql, params),
  connect: async () => wrapConnection(await pool.connect()),
  end: () => pool.end(),
  rawPool: pool,
  connectionSummary,
};
