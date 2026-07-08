const db = require('./config/db');

db.query('ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS rejection_reason TEXT;')
  .then(() => {
    console.log('Column added');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
