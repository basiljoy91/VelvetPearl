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
];

const UPDATED_AT_TRIGGER_TABLES = [
  { tableName: 'admins', triggerName: 'trg_admins_updated_at' },
  { tableName: 'admin_setup_keys', triggerName: 'trg_admin_setup_keys_updated_at' },
  { tableName: 'drivers', triggerName: 'trg_drivers_updated_at' },
  { tableName: 'fleet', triggerName: 'trg_fleet_updated_at' },
  { tableName: 'enquiries', triggerName: 'trg_enquiries_updated_at' },
];

const MIGRATIONS_DIR = path.resolve(__dirname, '..', '..', 'supabase', 'migrations');

const getSupabaseMigrationFiles = () => {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    throw new Error(`Supabase migrations directory not found: ${MIGRATIONS_DIR}`);
  }

  return fs.readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .map((name) => path.join(MIGRATIONS_DIR, name));
};

const loadSupabaseBootstrapSql = () => {
  const files = getSupabaseMigrationFiles();

  if (!files.length) {
    throw new Error(`No Supabase migration files were found in ${MIGRATIONS_DIR}`);
  }

  return {
    files,
    sql: files.map((filePath) => fs.readFileSync(filePath, 'utf8').trim()).join('\n\n'),
  };
};

const getSchemaPresence = async (db) => {
  const { rows } = await db.query(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY($1::text[])
    `,
    [REQUIRED_TABLES]
  );

  const availableTables = new Set(rows.map((row) => row.table_name));
  const missingTables = REQUIRED_TABLES.filter((tableName) => !availableTables.has(tableName));

  return {
    availableTables: [...availableTables].sort(),
    missingTables,
    isReady: missingTables.length === 0,
  };
};

const ensureRuntimeCompatibility = async (db) => {
  for (const { tableName } of UPDATED_AT_TRIGGER_TABLES) {
    await db.query(`
      ALTER TABLE public.${tableName}
      ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now()
    `);
  }

  await db.query(`
    CREATE OR REPLACE FUNCTION public.set_row_updated_at()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$;
  `);

  for (const { tableName, triggerName } of UPDATED_AT_TRIGGER_TABLES) {
    await db.query(`DROP TRIGGER IF EXISTS ${triggerName} ON public.${tableName}`);
    await db.query(`
      CREATE TRIGGER ${triggerName}
      BEFORE UPDATE ON public.${tableName}
      FOR EACH ROW
      EXECUTE FUNCTION public.set_row_updated_at()
    `);
  }
};

module.exports = {
  REQUIRED_TABLES,
  UPDATED_AT_TRIGGER_TABLES,
  MIGRATIONS_DIR,
  getSupabaseMigrationFiles,
  loadSupabaseBootstrapSql,
  getSchemaPresence,
  ensureRuntimeCompatibility,
};
