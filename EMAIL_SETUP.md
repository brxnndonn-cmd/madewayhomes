# Email Setup for MadeWayHomes

## Current State

The notification system is fully built and **email-ready**. All notifications are stored in the database and logged to the server console with `[EMAIL STUB]` prefix. Real email sending is **disabled** by default because it requires a paid email provider plan.

### What's Already Working

- ✅ Notifications are created in the database when events occur
- ✅ Admin is notified of new provider applications
- ✅ Admin is notified of new service requests
- ✅ Provider is notified when their application is submitted
- ✅ Customer is notified when their service request is received
- ✅ All notification triggers fire correctly — they just log to console instead of sending email

## Step-by-Step: Enabling Real Email Sending

### Step 1: Choose and Sign Up for an Email Provider

We recommend **[Resend.com](https://resend.com)** — they offer:
- **Free tier:** 100 emails/day (perfect for getting started)
- Simple REST API
- Great deliverability
- Easy to integrate

Other options: SendGrid, Mailgun, Postmark, AWS SES.

### Step 2: Get Your API Key

After signing up:
1. Go to your provider's dashboard
2. Generate an API key
3. Copy the key — you'll need it in the next step

### Step 3: Verify Your Sending Domain

Most providers require you to verify your domain (e.g., `madewayhomes.com`):
1. Follow your provider's domain verification instructions
2. This typically involves adding DNS records (TXT, CNAME, etc.)
3. Verification can take a few minutes to 48 hours

### Step 4: Add Environment Variables

Add these to your `.env` file in the project root:

```bash
EMAIL_API_KEY=re_xxxxxxxxxxxx    # Your Resend API key (or provider's key)
EMAIL_FROM=hello@madewayhomes.com  # Verified sending address
```

### Step 5: Implement the Email Sending Code

The notification service at `server/services/notifications.ts` already has the stub in place. To complete the integration, replace the email stub section in the `notifyUser()` function:

```typescript
// In server/services/notifications.ts, at the notifyUser function:

// Replace this block (around line 64-71):
if (process.env.EMAIL_API_KEY) {
  console.log(`[EMAIL] Sending real email to user ${userId}: "${title}"`);
  // TODO: Integrate with Resend, SendGrid, etc.
  // await sendEmail(userId, type, title, message);
} else {
  console.log(`[EMAIL STUB] Would send to user ${userId}: ${title}`);
}

// With this:
if (process.env.EMAIL_API_KEY) {
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
} else {
  console.log(`[EMAIL STUB] Would send to user ${userId}: ${title}`);
}
```

### Step 6: Restart the Server

```bash
# If running with bun run dev:
# Press Ctrl+C in the terminal where the server is running, then:
bun run dev

# Or restart just the server:
pkill -f "tsx.*server/index"
bun run dev:server
```

### Step 7: Test Email Sending

1. Submit a test service request via the Request a Service form
2. Check the server console — you should see `[EMAIL] Sent...` instead of `[EMAIL STUB]`
3. Check the recipient's inbox for the notification email

## Important Notes

- Email notifications are **non-blocking** — if an email fails, the notification is still stored in the database.
- Users can always view their notifications in the notification bell dropdown (header) even without email.
- All notification types also appear in the Admin Dashboard's "Recent Activity" feed.
- The system architecture supports any email provider — just swap the API call in the `notifyUser()` function.

## Notification Triggers Currently Active

| Event | Who Gets Notified | Type |
|-------|------------------|------|
| New service request submitted | Admin | `new_request` |
| New service request submitted | Customer (confirmation) | `request_received` |
| New provider application | Admin | `new_provider_application` |
| Provider application submitted | Provider (confirmation) | `application_submitted` |

All of these fire correctly and create database notification records. They just log to console instead of sending email until you complete the steps above.
