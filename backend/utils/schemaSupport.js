const fs = require('fs');
const path = require('path');

const REQUIRED_TABLES = [
  'admins',
  'admin_setup_keys',
  'drivers',
  'fleet',
  'enquiry_counters',
  'enquiries',
  'cab_enquiry_details',
  'room_enquiry_details',
  'tour_enquiry_details',
  'custom_trip_details',
  'enquiry_audit_log',
  'locations',
  'route_estimates',
  'popular_routes',
  'invoices',
  'invoice_items',
  'quotations',
  'quotation_items',
  'generated_documents',
  'document_delivery_logs',
  'document_counters',
];

const MYSQL_SCHEMA_FILE = path.resolve(__dirname, 'schema.mysql.sql');

const loadMysqlBootstrapSql = () => {
  if (!fs.existsSync(MYSQL_SCHEMA_FILE)) {
    throw new Error(`MySQL schema file not found: ${MYSQL_SCHEMA_FILE}`);
  }

  return {
    files: [MYSQL_SCHEMA_FILE],
    sql: fs.readFileSync(MYSQL_SCHEMA_FILE, 'utf8').trim(),
  };
};

const getSchemaPresence = async (db) => {
  const placeholders = REQUIRED_TABLES.map(() => '?').join(', ');
  const { rows } = await db.query(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name IN (${placeholders})
    `,
    REQUIRED_TABLES
  );

  const availableTables = new Set(rows.map((row) => row.table_name));
  const missingTables = REQUIRED_TABLES.filter((tableName) => !availableTables.has(tableName));

  return {
    availableTables: [...availableTables].sort(),
    missingTables,
    isReady: missingTables.length === 0,
  };
};

const hasColumn = async (db, tableName, columnName) => {
  const { rows } = await db.query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND column_name = ?
      LIMIT 1
    `,
    [tableName, columnName]
  );

  return rows.length > 0;
};

const addColumnIfMissing = async (db, tableName, columnName, definition) => {
  if (await hasColumn(db, tableName, columnName)) return;
  await db.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`);
};

const ensureRuntimeCompatibility = async (db) => {
  await addColumnIfMissing(db, 'admins', 'updated_at', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  await addColumnIfMissing(db, 'admin_setup_keys', 'updated_at', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  await addColumnIfMissing(db, 'drivers', 'updated_at', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  await addColumnIfMissing(db, 'fleet', 'updated_at', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  await addColumnIfMissing(db, 'enquiries', 'updated_at', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  await addColumnIfMissing(db, 'enquiries', 'service_details_json', 'JSON NULL');
  await addColumnIfMissing(db, 'enquiries', 'quote_amount', 'DECIMAL(12,2) NULL');
  await addColumnIfMissing(db, 'cab_enquiry_details', 'pickup_location_id', 'BIGINT UNSIGNED NULL');
  await addColumnIfMissing(db, 'cab_enquiry_details', 'drop_location_id', 'BIGINT UNSIGNED NULL');
  await addColumnIfMissing(db, 'cab_enquiry_details', 'pickup_location_json', 'JSON NULL');
  await addColumnIfMissing(db, 'cab_enquiry_details', 'drop_location_json', 'JSON NULL');
  await addColumnIfMissing(db, 'cab_enquiry_details', 'route_estimate_json', 'JSON NULL');

  await db.query("UPDATE drivers SET status = 'Unavailable' WHERE status = 'Inactive'");
  await db.query("UPDATE admins SET role = 'admin' WHERE role IS NULL OR role = ''");
  await db.query(`
    UPDATE admins
    SET is_main_admin = 1,
        role = 'main_admin'
    WHERE id = (
      SELECT first_admin.id
      FROM (
        SELECT id
        FROM admins
        ORDER BY id ASC
        LIMIT 1
      ) AS first_admin
    )
  `);
};

module.exports = {
  REQUIRED_TABLES,
  MYSQL_SCHEMA_FILE,
  loadMysqlBootstrapSql,
  getSchemaPresence,
  ensureRuntimeCompatibility,
};
