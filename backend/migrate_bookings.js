require('./config/loadEnv');
const db = require('./config/db');

(async () => {
  try {
    console.log('Running migration: Adding driver_id and driver_name to bookings table...');
    
    await db.query(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS driver_id VARCHAR(50),
      ADD COLUMN IF NOT EXISTS driver_name VARCHAR(255);
    `);
    
    console.log('✅ Migration successful!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await db.end();
    process.exit(0);
  }
})();
