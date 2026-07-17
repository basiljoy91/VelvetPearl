require('./config/loadEnv');
const Admin = require('./models/adminModel');
const db = require('./config/db');

(async () => {
  try {
    const count = await Admin.countAdmins();
    console.log('Admins count:', count);
    await db.end();
    process.exit(0);
  } catch (err) {
    console.error('DB Error:', err);
    await db.end().catch(() => {});
    process.exit(1);
  }
})();
