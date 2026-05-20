require('dotenv').config();
const { forgotPassword } = require('./controllers/authController');

const req = { body: { email: 'admin@velvetpearl.com' } }; // adjust based on DB
const res = {
  status: (code) => ({
    json: (data) => console.log('Status', code, 'Response', data)
  })
};

(async () => {
  try {
    await forgotPassword(req, res);
    process.exit(0);
  } catch (err) {
    console.error('Fatal Test Error:', err);
    process.exit(1);
  }
})();
