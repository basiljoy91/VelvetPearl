require('dotenv').config();
const db = require('./config/db');

(async () => {
  try {
    const [rows] = await db.execute('SELECT id, email, reset_token, reset_token_expiry FROM admins');
    console.log('Admins in DB:', rows);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
