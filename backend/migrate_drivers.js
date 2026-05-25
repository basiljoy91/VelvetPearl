require('./config/loadEnv'); // Assuming loadEnv handles .env loading
const db = require('./config/db');

(async () => {
  try {
    console.log('Running drivers table migration...');
    
    await db.query(`
      ALTER TABLE drivers
      ADD COLUMN IF NOT EXISTS photo TEXT,
      ADD COLUMN IF NOT EXISTS licence_status VARCHAR(50) DEFAULT 'Pending',
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS assigned_vehicle VARCHAR(50);
    `);
    
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();
