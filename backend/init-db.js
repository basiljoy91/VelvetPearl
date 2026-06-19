require('./config/loadEnv');
const db = require('./config/db');
const { getSchemaPresence, loadSupabaseBootstrapSql } = require('./utils/schemaSupport');

(async () => {
  try {
    console.log('Connecting to PostgreSQL/Supabase:', db.connectionSummary);

    const schemaPresence = await getSchemaPresence(db);

    if (schemaPresence.isReady) {
      console.log('Schema already present. Skipping bootstrap.');
      await db.end();
      process.exit(0);
    }

    if (schemaPresence.availableTables.length > 0) {
      throw new Error(
        `Detected a partial schema (${schemaPresence.availableTables.join(', ')}). `
        + 'Apply the remaining Supabase migrations manually instead of running a fresh bootstrap.'
      );
    }

    const { files, sql } = loadSupabaseBootstrapSql();

    console.log('Applying Supabase migrations:');
    files.forEach((filePath) => {
      console.log(`- ${filePath}`);
    });

    await db.query(sql);

    console.log('✅ PostgreSQL/Supabase schema created successfully!');
    await db.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to initialize database:', err.message);
    await db.end().catch(() => {});
    process.exit(1);
  }
})();
