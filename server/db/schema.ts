import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ── Users ──────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: text('role', { enum: ['customer', 'provider', 'admin'] }).notNull().default('customer'),
  name: text('name').notNull(),
  phone: text('phone'),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now'))`),
  status: text('status', { enum: ['active', 'suspended', 'deleted'] }).notNull().default('active'),
  reset_token: text('reset_token'),
  reset_token_expires: text('reset_token_expires'),
});

// ── Provider Profiles ──────────────────────────────────────────────
export const providerProfiles = sqliteTable('provider_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  business_name: text('business_name').notNull(),
  description: text('description'),
  logo_url: text('logo_url'),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  facebook: text('facebook'),
  instagram: text('instagram'),
  years_in_business: integer('years_in_business'),
  license_number: text('license_number'),
  insurance_provider: text('insurance_provider'),
  insurance_policy_number: text('insurance_policy_number'),
  business_hours: text('business_hours'), // JSON
  approval_status: text('approval_status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// ── Service Categories ─────────────────────────────────────────────
export const serviceCategories = sqliteTable('service_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sort_order: integer('sort_order').notNull().default(0),
  lead_price_cents: integer('lead_price_cents').notNull().default(0),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ── Provider Services (join table) ─────────────────────────────────
export const providerServices = sqliteTable('provider_services', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  provider_id: integer('provider_id').notNull().references(() => providerProfiles.id, { onDelete: 'cascade' }),
  category_id: integer('category_id').notNull().references(() => serviceCategories.id, { onDelete: 'cascade' }),
});

// ── Service Areas ──────────────────────────────────────────────────
export const serviceAreas = sqliteTable('service_areas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  provider_id: integer('provider_id').notNull().references(() => providerProfiles.id, { onDelete: 'cascade' }),
  city: text('city').notNull(),
  state: text('state').notNull().default('NC'),
  zip_code: text('zip_code'),
});

// ── Service Requests ───────────────────────────────────────────────
export const serviceRequests = sqliteTable('service_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  customer_id: integer('customer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category_id: integer('category_id').notNull().references(() => serviceCategories.id),
  city: text('city').notNull(),
  zip_code: text('zip_code'),
  description: text('description').notNull(),
  budget_min: integer('budget_min'),
  budget_max: integer('budget_max'),
  preferred_date: text('preferred_date'),
  contact_preference: text('contact_preference', { enum: ['phone', 'text', 'email'] }).default('email'),
  status: text('status', { enum: ['new', 'matched', 'in_progress', 'completed', 'canceled'] }).notNull().default('new'),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// ── Request Images ─────────────────────────────────────────────────
export const requestImages = sqliteTable('request_images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  request_id: integer('request_id').notNull().references(() => serviceRequests.id, { onDelete: 'cascade' }),
  image_url: text('image_url').notNull(),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ── Provider Images ────────────────────────────────────────────────
export const providerImages = sqliteTable('provider_images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  provider_id: integer('provider_id').notNull().references(() => providerProfiles.id, { onDelete: 'cascade' }),
  image_url: text('image_url').notNull(),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ── Leads ──────────────────────────────────────────────────────────
export const leads = sqliteTable('leads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  request_id: integer('request_id').notNull().references(() => serviceRequests.id, { onDelete: 'cascade' }),
  provider_id: integer('provider_id').notNull().references(() => providerProfiles.id, { onDelete: 'cascade' }),
  status: text('status', {
    enum: ['new', 'matched', 'available', 'purchased', 'contacted', 'scheduled', 'completed', 'canceled', 'refunded', 'disputed'],
  }).notNull().default('new'),
  purchased_at: text('purchased_at'),
  price_cents: integer('price_cents').default(0),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// ── Subscription Plans ─────────────────────────────────────────────
export const subscriptionPlans = sqliteTable('subscription_plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  price_cents_monthly: integer('price_cents_monthly').notNull().default(0),
  features: text('features'), // JSON
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sort_order: integer('sort_order').notNull().default(0),
});

// ── Subscriptions ──────────────────────────────────────────────────
export const subscriptions = sqliteTable('subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  provider_id: integer('provider_id').notNull().references(() => providerProfiles.id, { onDelete: 'cascade' }),
  plan_id: integer('plan_id').notNull().references(() => subscriptionPlans.id),
  status: text('status', { enum: ['active', 'canceled', 'past_due'] }).notNull().default('active'),
  stripe_subscription_id: text('stripe_subscription_id'),
  current_period_start: text('current_period_start'),
  current_period_end: text('current_period_end'),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ── Payments ───────────────────────────────────────────────────────
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id),
  amount_cents: integer('amount_cents').notNull(),
  payment_type: text('payment_type', { enum: ['subscription', 'lead'] }).notNull(),
  reference_id: integer('reference_id'),
  stripe_payment_intent_id: text('stripe_payment_intent_id'),
  status: text('status', { enum: ['succeeded', 'failed', 'refunded'] }).notNull().default('succeeded'),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ── Reviews ────────────────────────────────────────────────────────
export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  customer_id: integer('customer_id').notNull().references(() => users.id),
  provider_id: integer('provider_id').notNull().references(() => providerProfiles.id, { onDelete: 'cascade' }),
  request_id: integer('request_id').references(() => serviceRequests.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ── Saved Providers ────────────────────────────────────────────────
export const savedProviders = sqliteTable('saved_providers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  customer_id: integer('customer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider_id: integer('provider_id').notNull().references(() => providerProfiles.id, { onDelete: 'cascade' }),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ── Notifications ──────────────────────────────────────────────────
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message'),
  is_read: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  metadata: text('metadata'), // JSON
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ── Admin Notes ────────────────────────────────────────────────────
export const adminNotes = sqliteTable('admin_notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  admin_id: integer('admin_id').notNull().references(() => users.id),
  target_type: text('target_type', { enum: ['request', 'provider', 'user'] }).notNull(),
  target_id: integer('target_id').notNull(),
  note: text('note').notNull(),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ── Follow-Up Tasks ────────────────────────────────────────────────
export const followUpTasks = sqliteTable('follow_up_tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  admin_id: integer('admin_id').notNull().references(() => users.id),
  target_type: text('target_type').notNull(),
  target_id: integer('target_id').notNull(),
  due_date: text('due_date'),
  is_completed: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
  notes: text('notes'),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ── Audit Logs ─────────────────────────────────────────────────────
export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id'),
  action: text('action').notNull(),
  details: text('details'), // JSON
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ── Contact Messages ───────────────────────────────────────────────
export const contactMessages = sqliteTable('contact_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  is_read: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ── Email Signups ──────────────────────────────────────────────────
export const emailSignups = sqliteTable('email_signups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ── Site Settings ──────────────────────────────────────────────────
export const siteSettings = sqliteTable('site_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value'),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// ── Discount Codes ─────────────────────────────────────────────────
export const discountCodes = sqliteTable('discount_codes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  discount_percent: integer('discount_percent'),
  discount_cents: integer('discount_cents'),
  max_uses: integer('max_uses'),
  current_uses: integer('current_uses').notNull().default(0),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  expires_at: text('expires_at'),
});
