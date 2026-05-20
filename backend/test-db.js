require('dotenv').config();
const Admin = require('./models/adminModel');

(async () => {
  try {
    const count = await Admin.countAdmins();
    console.log('Admins count:', count);
    process.exit(0);
  } catch (err) {
    console.error('DB Error:', err);
    process.exit(1);
  }
})();
