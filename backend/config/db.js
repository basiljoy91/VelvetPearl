require('./loadEnv');
const mysql = require('mysql2/promise');

const JSON_COLUMNS = new Set(['service_details_json', 'metadata_json']);
const BOOLEAN_COLUMNS = new Set(['is_main_admin', 'used', 'consent_to_contact', 'is_archived']);
const normalizeMysqlHost = (host) => (host === 'localhost' ? '127.0.0.1' : host);

const parseDatabaseUrl = (value) => {
  const url = new URL(value);

  if (!['mysql:', 'mariadb:'].includes(url.protocol)) {
    throw new Error(`Unsupported database protocol: ${url.protocol}`);
  }

  return {
    host: normalizeMysqlHost(url.hostname),
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, '')),
  };
};

const connectionConfig = process.env.DATABASE_URL
  ? parseDatabaseUrl(process.env.DATABASE_URL)
  : {
      host: normalizeMysqlHost(process.env.DB_HOST || '127.0.0.1'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT || 3306),
    };

if (String(process.env.DB_SSL || '').toLowerCase() === 'true') {
  connectionConfig.ssl = { rejectUnauthorized: false };
}

const connectionSummary = {
  source: process.env.DATABASE_URL ? 'DATABASE_URL' : 'DB_*',
  host: connectionConfig.host,
  port: connectionConfig.port,
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

const pool = mysql.createPool({
  ...connectionConfig,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
  queueLimit: 0,
  multipleStatements: true,
  charset: 'utf8mb4',
  dateStrings: true,
});

const convertPostgresPlaceholders = (sql, params = []) => {
  const translatedParams = [];

  const translatedSql = sql.replace(/\$(\d+)/g, (_, rawIndex) => {
    const index = Number(rawIndex) - 1;
    translatedParams.push(params[index]);
    return '?';
  });

  return {
    sql: translatedSql,
    params: translatedParams.length ? translatedParams : params,
  };
};

const normalizeJsonValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return {};
  }

  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const normalizeRow = (row = {}) => {
  const normalized = {};

  Object.entries(row).forEach(([key, value]) => {
    if (JSON_COLUMNS.has(key)) {
      normalized[key] = normalizeJsonValue(value);
      return;
    }

    if (BOOLEAN_COLUMNS.has(key)) {
      normalized[key] = value === null ? null : Boolean(value);
      return;
    }

    normalized[key] = value;
  });

  return normalized;
};

const executeQuery = async (connection, sql, params = []) => {
  const { sql: translatedSql, params: translatedParams } = convertPostgresPlaceholders(sql, params);
  const [result] = await connection.query(translatedSql, translatedParams);

  if (Array.isArray(result)) {
    return {
      rows: result.map((row) => normalizeRow(row)),
      rowCount: result.length,
    };
  }

  return {
    rows: [],
    rowCount: Number(result.affectedRows || 0),
    insertId: result.insertId ? Number(result.insertId) : null,
  };
};

const wrapConnection = (connection) => ({
  query: (sql, params = []) => executeQuery(connection, sql, params),
  beginTransaction: () => connection.beginTransaction(),
  commit: () => connection.commit(),
  rollback: () => connection.rollback(),
  release: () => connection.release(),
});

module.exports = {
  query: (sql, params = []) => executeQuery(pool, sql, params),
  connect: async () => wrapConnection(await pool.getConnection()),
  end: () => pool.end(),
  rawPool: pool,
  connectionSummary,
};
