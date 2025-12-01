# Email Verification Setup Guide

## Overview
Email verification has been implemented using SendGrid's Web API (HTTPS-based, works on Render free tier).

## Setup Steps

### 1. Get SendGrid API Key

1. Sign up for a free SendGrid account at https://sendgrid.com
2. Go to Settings > API Keys
3. Create a new API key with "Mail Send" permissions
4. Copy the API key (you'll only see it once!)

### 2. Verify Sender Email

SendGrid requires you to verify the email address you'll send from:

1. Go to Settings > Sender Authentication
2. Choose "Single Sender Verification" (easiest for free tier)
3. Add your email address and verify it
4. Use this verified email as your `FROM_EMAIL`

### 3. Configure Environment Variables

Add these to your `.env` file:

```bash
SENDGRID_API_KEY=your-sendgrid-api-key-here
FROM_EMAIL=your-verified-email@example.com
APP_URL=https://your-app.onrender.com
```

For local development:
```bash
APP_URL=http://localhost:3000
```

### 4. Update Database Schema

Run the migration to add email verification columns:

```bash
npm run migrate:verification
```

Or manually run:
```bash
node server/migrations/add_email_verification.js
```

### 5. Test Locally

1. Start your server: `npm run dev`
2. Sign up with a real email address
3. Check your inbox for the verification email
4. Click the verification link

## How It Works

### Signup Flow
1. User signs up with email/password
2. Account is created with `email_verified = false`
3. Verification token is generated and stored
4. Verification email is sent via SendGrid
5. User receives email with verification link

### Verification Flow
1. User clicks link: `https://yourapp.com/verify-email?token=xyz`
2. Frontend detects token in URL
3. API validates token and expiration (24 hours)
4. User's `email_verified` is set to `true`
5. Success message is displayed

### Features
- Verification banner shown to unverified users
- Resend verification email button
- Token expires after 24 hours
- Verification emails styled to match terminal theme
- **Protected routes**: Users must verify email to generate/save/view posts
- Graceful error messages when verification is required

## Database Schema

New columns added to `users` table:
- `email_verified` (BOOLEAN, default FALSE)
- `verification_token` (VARCHAR)
- `verification_token_expires` (TIMESTAMP)

## API Endpoints

### POST /api/auth/signup
Creates account and sends verification email.

### GET /api/auth/verify-email?token=xyz
Verifies email with token.

### POST /api/auth/resend-verification
Resends verification email.
Body: `{ "email": "user@example.com" }`

## Troubleshooting

### Email not sending
- Check SENDGRID_API_KEY is set correctly
- Verify FROM_EMAIL is verified in SendGrid
- Check server logs for SendGrid errors
- Ensure you're within SendGrid's free tier limits (100 emails/day)

### Verification link not working
- Check APP_URL is set correctly
- Ensure token hasn't expired (24 hours)
- Check browser console for errors

### Port blocking on Render
- SendGrid Web API uses HTTPS (port 443), not SMTP ports
- No additional configuration needed for Render

## SendGrid Free Tier Limits
- 100 emails per day
- Perfect for small apps and testing
- Upgrade to paid plan for higher volume

## Future Enhancements
- Password reset functionality (email.js already has the function)
- Email templates with better branding
- Rate limiting on resend verification
- Admin panel to manually verify users


## Protected Routes

The following routes require email verification:

- **POST /api/generate** - Generate social media posts
- **POST /api/posts** - Save posts
- **GET /api/posts** - View saved posts
- **DELETE /api/posts/:id** - Delete posts

Unverified users will receive a 403 error with the message:
```json
{
  "error": "Email verification required",
  "message": "Please verify your email address to access this feature."
}
```

## Customizing Verification Requirements

To make a route require verification, use both middleware:
```javascript
app.post('/api/your-route', auth.authMiddleware, auth.requireVerifiedEmail, async (req, res) => {
  // Your protected code here
});
```

To allow unverified users (authentication only):
```javascript
app.post('/api/your-route', auth.authMiddleware, async (req, res) => {
  // Check req.user.emailVerified if needed
});
```
