require('./config/loadEnv');
const db = require('./config/db');

(async () => {
  try {
    const { rows } = await db.query('SELECT id, email, reset_token, reset_token_expiry FROM admins');
    console.log('Admins in DB:', rows);
    await db.end();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    await db.end().catch(() => {});
    process.exit(1);
  }
})();
