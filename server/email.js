const sgMail = require('@sendgrid/mail');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourdomain.com';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// Initialize SendGrid
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('Warning: SENDGRID_API_KEY not set. Email verification will not work.');
}

// Send verification email
async function sendVerificationEmail(email, token) {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;
  
  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Verify Your Email Address',
    text: `Please verify your email address by clicking this link: ${verificationUrl}\n\nThis link will expire in 24 hours.`,
    html: `
      <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000; color: #0f0;">
        <h2 style="color: #0f0;">✓ Verify Your Email</h2>
        <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #0f0; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #888; font-size: 12px;">
          Or copy and paste this link into your browser:<br>
          ${verificationUrl}
        </p>
        <p style="color: #888; font-size: 12px;">
          This link will expire in 24 hours.
        </p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    if (error.response) {
      console.error('SendGrid error:', error.response.body);
    }
    throw new Error('Failed to send verification email');
  }
}

// Send password reset email (for future use)
async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  
  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Reset Your Password',
    text: `Reset your password by clicking this link: ${resetUrl}\n\nThis link will expire in 1 hour.`,
    html: `
      <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000; color: #0f0;">
        <h2 style="color: #0f0;">🔒 Reset Your Password</h2>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #0f0; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #888; font-size: 12px;">
          Or copy and paste this link into your browser:<br>
          ${resetUrl}
        </p>
        <p style="color: #888; font-size: 12px;">
          This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
