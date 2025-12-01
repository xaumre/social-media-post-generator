require('dotenv').config();
const { pool } = require('../db');

async function addEmailVerificationColumns() {
  const client = await pool.connect();
  
  try {
    console.log('Adding email verification columns to users table...');
    
    // Add columns if they don't exist
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP
    `);
    
    console.log('✓ Email verification columns added successfully');
    console.log('✓ Existing users will have email_verified = false by default');
    
  } catch (error) {
    console.error('Error adding email verification columns:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
addEmailVerificationColumns()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
