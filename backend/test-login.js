require('dotenv').config();
const { loginAdmin } = require('./controllers/authController');

const req = { body: { email: 'admin@velvetpearl.com', password: 'password123' } };
const res = {
  status: (code) => ({
    json: (data) => console.log('Status', code, 'Response', data)
  })
};

(async () => {
  try {
    await loginAdmin(req, res);
    process.exit(0);
  } catch (err) {
    console.error('Fatal Test Error:', err);
    process.exit(1);
  }
})();
