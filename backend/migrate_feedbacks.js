require('./config/loadEnv');
const db = require('./config/db');

async function migrate() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS public.feedbacks (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        feedback TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Table feedbacks created!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

migrate();
