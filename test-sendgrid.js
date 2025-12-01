require('dotenv').config();
const sgMail = require('@sendgrid/mail');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL;

console.log('Testing SendGrid configuration...');
console.log('FROM_EMAIL:', FROM_EMAIL);
console.log('API_KEY set:', SENDGRID_API_KEY ? 'Yes' : 'No');

if (!SENDGRID_API_KEY) {
  console.error('❌ SENDGRID_API_KEY is not set in .env file');
  process.exit(1);
}

sgMail.setApiKey(SENDGRID_API_KEY);

const msg = {
  to: 'azmit@yahoo.com', // Change to your test email
  from: FROM_EMAIL,
  subject: 'SendGrid Test Email',
  text: 'This is a test email from your Vibe Terminal app.',
  html: '<strong>This is a test email from your Vibe Terminal app.</strong>',
};

console.log('\nAttempting to send test email...\n');

sgMail
  .send(msg)
  .then(() => {
    console.log('✅ Email sent successfully!');
    console.log('Check your inbox at azmit@yahoo.com');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error sending email:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('\nSendGrid Response:');
      console.error(JSON.stringify(error.response.body, null, 2));
    }
    
    console.log('\n📋 Common issues:');
    console.log('1. FROM_EMAIL not verified in SendGrid');
    console.log('   → Go to: https://app.sendgrid.com/settings/sender_auth/senders');
    console.log('   → Add and verify your sender email');
    console.log('2. Invalid API key');
    console.log('   → Check your API key at: https://app.sendgrid.com/settings/api_keys');
    console.log('3. API key permissions');
    console.log('   → Ensure "Mail Send" permission is enabled');
    
    process.exit(1);
  });
