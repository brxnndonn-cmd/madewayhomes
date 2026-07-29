# Launch Checklist — MadeWayHomes MVP

Use this checklist before going live. Every item should be checked off before inviting real customers and providers.

## Pre-Launch Checklist

### Data Cleanup
- [ ] **Replace demo data:** Run `bun run seed:clear` to remove all `[DEMO]` users, providers, and requests
- [ ] **Add real providers:** Recruit and onboard at least 5 real local service providers
- [ ] **Verify provider listings:** Check that approved providers appear in the directory with correct info (services, areas, description, photos)
- [ ] **Remove/update non-demo data:** The original demo users (customer@example.com, provider@example.com) are not removed by `seed:clear`. Delete or update them manually

### Site Configuration
- [ ] **Update site settings in admin dashboard:** Site name, tagline, contact email, service area
- [ ] **Review and customize legal pages:**
  - Privacy Policy (`/privacy`)
  - Terms of Service (`/terms`)
  - Ensure both reflect your actual business practices
- [ ] **Have legal documents reviewed by an attorney** — do not launch with placeholder legal content

### Email
- [ ] **Configure real email sending:** See `EMAIL_SETUP.md` for setup instructions
- [ ] **Verify email notifications work:** Test new request notification, provider approval notification, application submission confirmation
- [ ] **Set up a professional sending domain** (e.g., hello@madewayhomes.com) with SPF/DKIM/DMARC

### Payments (Future — not in MVP)
- [ ] Set up Stripe account at stripe.com
- [ ] Add `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` to `.env`
- [ ] See `STRIPE_SETUP.md` for future integration notes

### Domain & Hosting
- [ ] **Register a domain** (e.g., madewayhomes.com)
- [ ] **Configure DNS:** Point domain to your hosting provider
- [ ] **Set up SSL:** Ensure HTTPS is enabled
- [ ] **Configure environment variables** in production (JWT_SECRET, DATABASE_PATH, etc.)

### Analytics & Tracking
- [ ] **Set up Google Analytics:** Add `GA_MEASUREMENT_ID` to `.env` and include the GA script
- [ ] Consider setting up UTM parameters for marketing campaigns

### Security
- [ ] **Change admin password** — do not use the default Admin123!
- [ ] **Set a strong JWT_SECRET** in production `.env`
- [ ] **Enable rate limiting** on auth endpoints (login, register, forgot-password)
- [ ] **Review CORS settings** for production
- [ ] **Set NODE_ENV=production**

### Testing
- [ ] **Test the full customer flow:**
  1. Register as a new customer
  2. Submit a service request with photos
  3. Receive confirmation
- [ ] **Test the full provider flow:**
  1. Register as a new provider
  2. Submit an application with logo and work photos
  3. As admin, approve the application
  4. Verify the provider appears in the directory
  5. Verify the provider appears in "Approved Providers" for matching
- [ ] **Test the admin workflow:**
  1. Review pending provider applications
  2. Approve/reject providers
  3. View and filter service requests
  4. Match a request to a provider
  5. Add notes to a request
  6. Update request status
  7. Export CSV
- [ ] **Test contact form:** Submit and verify it appears in admin messages
- [ ] **Test email signup:** Verify the newsletter signup works
- [ ] **Test password reset flow**
- [ ] **Test mobile on real devices:** iPhone SE (375px), iPhone 14, Android phones
- [ ] **Test on multiple browsers:** Chrome, Safari, Firefox, Edge
- [ ] **Verify all forms submit correctly** and validation works
- [ ] **Verify error states** (try submitting empty forms, invalid emails, etc.)
- [ ] **Verify all pages load without errors:**
  - `/` (Home)
  - `/request` (Request a Service)
  - `/list-your-business` (Provider Application)
  - `/providers` (Provider Directory)
  - `/providers/:id` (Provider Profile)
  - `/how-it-works`
  - `/about`
  - `/contact`
  - `/services`
  - `/login`
  - `/register`
  - `/admin` (admin only)
  - `/privacy`
  - `/terms`

### Content Review
- [ ] **Review all page copy** for accuracy and typos
- [ ] **Verify service categories** match the services offered in your area
- [ ] **Add a favicon** — replace the placeholder comment in `client/index.html`
- [ ] **Add Open Graph image** for social sharing

### Go Live
- [ ] **Back up the database** before the final launch
- [ ] **Deploy the production build** (`bun run build` then `bun run start`)
- [ ] **Monitor the server logs** for the first 24 hours
- [ ] **🚀 Launch!**

## Post-Launch

- [ ] Monitor new provider applications daily
- [ ] Respond to customer service requests within 24 hours
- [ ] Follow up with matched providers to ensure they're contacting customers
- [ ] Collect feedback from early customers and providers
- [ ] Plan Phase 2 features based on real usage data

---

**Target:** Recruit 5 local providers and collect 10 real customer service requests before adding paid features.
