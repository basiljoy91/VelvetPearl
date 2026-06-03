require('./config/loadEnv'); // Assuming loadEnv handles .env loading
const db = require('./config/db');

(async () => {
  try {
    console.log('Running drivers table migration...');
    
    await db.query(`
      ALTER TABLE drivers
      ADD COLUMN IF NOT EXISTS photo TEXT,
      ADD COLUMN IF NOT EXISTS licence_status VARCHAR(50) DEFAULT 'Pending',
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS assigned_vehicle VARCHAR(50);
    `);

    await db.query(`
      UPDATE drivers
      SET status = 'Unavailable'
      WHERE status = 'Inactive';
    `);

    await db.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE constraint_schema = current_schema()
            AND table_name = 'drivers'
            AND constraint_name = 'drivers_status_check'
        ) THEN
          ALTER TABLE drivers DROP CONSTRAINT drivers_status_check;
        END IF;

        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE constraint_schema = current_schema()
            AND table_name = 'drivers'
            AND constraint_name = 'drivers_status_check'
        ) THEN
          ALTER TABLE drivers
          ADD CONSTRAINT drivers_status_check
          CHECK (status IN ('Active', 'Unavailable'));
        END IF;
      END $$;
    `);
    
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();
