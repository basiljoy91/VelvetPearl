require('./config/loadEnv');
const db = require('./config/db');
const {
  ensureRuntimeCompatibility,
  getSchemaPresence,
  loadMysqlBootstrapSql,
} = require('./utils/schemaSupport');

(async () => {
  try {
    console.log('Connecting to MySQL/MariaDB:', db.connectionSummary);

    const schemaPresence = await getSchemaPresence(db);

    if (schemaPresence.isReady) {
      console.log('Schema already present. Applying compatibility checks.');
    } else if (schemaPresence.availableTables.length > 0) {
      console.log(
        `Partial schema detected (${schemaPresence.availableTables.join(', ')}). `
        + 'Applying the MySQL schema to add missing tables.'
      );
    }

    if (!schemaPresence.isReady) {
      const { files, sql } = loadMysqlBootstrapSql();

      console.log('Applying MySQL schema:');
      files.forEach((filePath) => {
        console.log(`- ${filePath}`);
      });

      await db.query(sql);
    }

    await ensureRuntimeCompatibility(db);
    const finalPresence = await getSchemaPresence(db);
    if (!finalPresence.isReady) {
      throw new Error(`MySQL schema is still incomplete: ${finalPresence.missingTables.join(', ')}`);
    }

    console.log('MySQL/MariaDB schema is ready.');
    await db.end();
    process.exit(0);
  } catch (err) {
    console.error('Failed to initialize database:', err.message);
    await db.end().catch(() => {});
    process.exit(1);
  }
})();
