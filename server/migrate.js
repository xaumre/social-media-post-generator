require('dotenv').config();
const { initDatabase, pool } = require('./db');

async function migrate() {
  console.log('Running database migrations...');
  
  try {
    await initDatabase();
    console.log('✓ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
