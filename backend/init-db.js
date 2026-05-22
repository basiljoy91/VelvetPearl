require('./config/loadEnv');
const fs = require('fs');
const path = require('path');
const db = require('./config/db');

(async () => {
  try {
    console.log('Connecting to database:', process.env.DB_NAME || process.env.PGDATABASE || 'postgres');

    const schemaPath = path.join(__dirname, 'utils', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema.sql...');
    await db.query(schemaSql);

    console.log('✅ Tables created successfully!');
    await db.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to initialize database:', err.message);
    await db.end().catch(() => {});
    process.exit(1);
  }
})();
