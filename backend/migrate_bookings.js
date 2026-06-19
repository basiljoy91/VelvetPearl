require('./config/loadEnv');
const db = require('./config/db');

(async () => {
  try {
    console.log('Legacy bookings migrations are no longer required. The app now uses the enquiries tables in PostgreSQL / Supabase.');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await db.end();
    process.exit(0);
  }
})();
