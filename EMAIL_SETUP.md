# Email Setup for MadeWayHomes

## Current State

The notification system is fully built and **email-ready**. All notifications are stored in the database and logged to the server console with `[EMAIL STUB]` prefix. Real email sending is **disabled** by default because it requires a paid email provider plan.

## Enabling Real Email Sending

To enable real email notifications:

### 1. Sign Up for an Email Provider

We recommend **[Resend.com](https://resend.com)** — they offer:
- **Free tier:** 100 emails/day
- Simple REST API
- Great deliverability
- Easy to integrate

Other options: SendGrid, Mailgun, Postmark, AWS SES.

### 2. Add Environment Variables

Add these to your `.env` file:

```bash
EMAIL_API_KEY=re_xxxxxxxxxxxx    # Your Resend API key (or provider's key)
EMAIL_FROM=hello@madewayhomes.com  # Verified sending address
```

### 3. Restart the Server

```bash
# Kill the running server and restart
pkill -f "tsx.*server/index"
bun run dev:server
```

### 4. How It Works

When `EMAIL_API_KEY` is set in the environment:
- The notification service in `server/services/notifications.ts` detects it
- Instead of logging `[EMAIL STUB]`, it logs `[EMAIL] Sending real email...`
- You need to implement the actual email sending in the `notifyUser()` function

### 5. Implementation Guide

To complete email integration, modify `server/services/notifications.ts`:

```typescript
// At the top of notifyUser(), replace the email stub section:

if (process.env.EMAIL_API_KEY) {
  // Get user email
  const user = sqlite.prepare('SELECT email, name FROM users WHERE id = ?').get(userId) as any;
  if (user?.email) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.EMAIL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'hello@madewayhomes.com',
          to: user.email,
          subject: title,
          html: `<h2>${title}</h2><p>${message}</p>`,
        }),
      });
      console.log(`[EMAIL] Sent "${title}" to ${user.email}`);
    } catch (err) {
      console.error(`[EMAIL] Failed to send to user ${userId}:`, err);
    }
  }
}
```

### 6. Notes

- Email notifications are **non-blocking** — if an email fails, the notification is still stored in the database.
- Users can always view their notifications in the notification bell dropdown (header) even without email.
- All notification types also appear in the Admin Dashboard's "Recent Activity" feed.
- The system architecture supports any email provider — just swap the API call.
