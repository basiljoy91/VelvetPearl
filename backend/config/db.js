require('./loadEnv');
const mysql = require('mysql2/promise');

const SUPPORTED_PROTOCOLS = new Set(['mysql:', 'mariadb:']);

const normalizeDialect = (value) => String(value || 'mysql').trim().toLowerCase();

const parseDatabaseUrl = (value) => {
  const url = new URL(value);

  if (!SUPPORTED_PROTOCOLS.has(url.protocol)) {
    throw new Error(
      `Invalid DATABASE_URL protocol "${url.protocol}". The backend is MySQL/MariaDB-only. `
      + 'Replace DATABASE_URL with mysql://... or clear it and set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME in backend/.env.'
    );
  }

  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username || ''),
    password: decodeURIComponent(url.password || ''),
    database: decodeURIComponent(url.pathname.replace(/^\//, '')),
  };
};

const dialect = normalizeDialect(process.env.DB_DIALECT);

if (dialect !== 'mysql') {
  throw new Error(`Unsupported DB_DIALECT "${dialect}". This backend is configured for Hostinger-compatible MySQL/MariaDB.`);
}

const connectionConfig = process.env.DATABASE_URL
  ? parseDatabaseUrl(process.env.DATABASE_URL)
  : {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
  };

const shouldUseSsl = String(process.env.DB_SSL || '').toLowerCase() === 'true';

if (shouldUseSsl) {
  connectionConfig.ssl = { rejectUnauthorized: false };
}

const connectionSummary = {
  dialect,
  source: process.env.DATABASE_URL ? 'DATABASE_URL' : 'DB_*',
  host: connectionConfig.host || '(missing)',
  port: connectionConfig.port || 3306,
  user: connectionConfig.user || '(missing)',
  database: connectionConfig.database || '(missing)',
  ssl: Boolean(connectionConfig.ssl),
};

const validateConnectionConfig = () => {
  if (!connectionConfig.user) {
    throw new Error('Database user is missing. Set DATABASE_URL or DB_USER.');
  }

  if (!connectionConfig.database) {
    throw new Error('Database name is missing. Set DATABASE_URL or DB_NAME.');
  }
};

validateConnectionConfig();

const serializeParam = (value) => {
  if (value === undefined) return null;
  if (value === null) return null;
  if (value instanceof Date) return value;
  if (Buffer.isBuffer(value)) return value;
  if (Array.isArray(value) || (typeof value === 'object' && value.constructor === Object)) {
    return JSON.stringify(value);
  }
  if (typeof value === 'boolean') return value ? 1 : 0;
  return value;
};

const normalizePlaceholders = (sql, params) => {
  if (!/\$\d+/.test(sql)) {
    return { sql, params };
  }

  const normalizedParams = [];
  const normalizedSql = sql.replace(/\$(\d+)/g, (_match, index) => {
    normalizedParams.push(params[Number(index) - 1]);
    return '?';
  });

  return { sql: normalizedSql, params: normalizedParams };
};

const normalizeRows = (result) => {
  if (Array.isArray(result)) {
    return {
      rows: result,
      rowCount: result.length,
      insertId: null,
    };
  }

  return {
    rows: [],
    rowCount: Number(result?.affectedRows || 0),
    insertId: result?.insertId || null,
  };
};

const normalizeResult = ([result]) => normalizeRows(result);

const pool = mysql.createPool({
  ...connectionConfig,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
  queueLimit: 0,
  multipleStatements: true,
  dateStrings: true,
  namedPlaceholders: false,
});

const runQuery = async (runner, sql, params = []) => {
  const normalized = normalizePlaceholders(sql, params);
  const preparedParams = normalized.params.map(serializeParam);

  if (!preparedParams.length) {
    return normalizeResult(await runner.query(normalized.sql));
  }

  return normalizeResult(await runner.execute(normalized.sql, preparedParams));
};

const wrapConnection = (connection) => ({
  query: (sql, params = []) => runQuery(connection, sql, params),
  beginTransaction: () => connection.beginTransaction(),
  commit: () => connection.commit(),
  rollback: () => connection.rollback(),
  release: () => connection.release(),
});

module.exports = {
  dialect,
  query: (sql, params = []) => runQuery(pool, sql, params),
  connect: async () => wrapConnection(await pool.getConnection()),
  end: () => pool.end(),
  rawPool: pool,
  connectionSummary,
};
