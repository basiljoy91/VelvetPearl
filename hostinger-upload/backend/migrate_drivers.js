require('./config/loadEnv'); // Assuming loadEnv handles .env loading
const db = require('./config/db');

(async () => {
  try {
    console.log('Running driver data normalization...');
    await db.query(`
      UPDATE drivers
      SET status = 'Unavailable'
      WHERE status = 'Inactive';
    `);

    console.log('Driver normalization completed successfully.');
    await db.end();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    await db.end().catch(() => {});
    process.exit(1);
  }
})();
