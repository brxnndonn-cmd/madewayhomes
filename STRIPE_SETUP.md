# Stripe Payment Setup

**Payments are not yet implemented in the MVP.** This document outlines the plan for adding Stripe integration in a future phase.

## Current State

The database schema already includes tables for:
- `subscription_plans` — Plan definitions with pricing
- `subscriptions` — Provider subscriptions linked to plans
- `payments` — Payment records with Stripe payment intent IDs
- `leads` — Lead records with pricing for lead purchasing

The admin dashboard and provider application forms are ready for paid features. The subscription plan data is seeded with four tiers (Free, Starter, Growth, Featured Partner) but no payment processing is wired up.

## Future Integration Steps

### 1. Create a Stripe Account

- Sign up at [stripe.com](https://stripe.com)
- Get your API keys from the Stripe Dashboard → Developers → API keys
- Use test mode keys for development

### 2. Add Environment Variables

```bash
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
```

### 3. Install Stripe SDK

```bash
bun add stripe @stripe/stripe-js
```

### 4. Create Stripe Integration

The planned integration includes:

#### Backend (`server/services/stripe.ts`)
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Create checkout session for subscription
export async function createCheckoutSession(providerId: number, planId: number) { ... }

// Create payment intent for lead purchase
export async function createLeadPayment(leadId: number, amount: number) { ... }

// Handle Stripe webhook events
export async function handleWebhook(event: Stripe.Event) { ... }
```

#### Frontend (checkout page)
- Stripe Elements for card collection
- Checkout page at `/checkout?plan=starter`
- Lead purchase flow: "Unlock this lead for $5.00"

#### API Routes (`server/routes/payments.ts`)
- `POST /api/payments/create-checkout` — Start subscription checkout
- `POST /api/payments/lead-purchase` — Purchase a lead
- `GET /api/payments/history` — Payment history
- `POST /api/webhooks/stripe` — Stripe webhook handler

### 5. Database Changes Needed

- Add `stripe_customer_id` to `users` table
- Add `stripe_price_id` to `subscription_plans` table (for Stripe product/price mapping)
- Add `stripe_product_id` to `subscription_plans`

### 6. Test

- Use Stripe test mode with test card numbers
- Test subscription creation, renewal, and cancellation
- Test lead purchasing flow
- Test webhook handling (use Stripe CLI for local testing)

## Pricing Model (Planned)

| Plan | Monthly Price | Lead Access |
|------|--------------|-------------|
| Free | $0 | 5 views/month |
| Starter | $29 | 20 views/month |
| Growth | $79 | Unlimited |
| Featured Partner | $149 | Unlimited + top placement |

Lead prices are per-category, set in `service_categories.lead_price_cents`. Example: Plumbing leads at $5.00, Handyman leads at $3.00.

## Notes

- Stripe integration was intentionally deferred to post-MVP
- Focus on proving the marketplace works first: recruit 5 real providers and collect 10 real customer requests
- The subscription system supports multiple plans from day 1 — no schema changes needed to add payments
- All payment-related tables and columns already exist in the schema
