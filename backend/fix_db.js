const db = require('./config/db');
db.query("ALTER TABLE drivers ADD COLUMN IF NOT EXISTS availability_status VARCHAR(50) DEFAULT 'Available'")
  .then(() => { console.log('Fixed'); process.exit(0); })
  .catch(console.error);
