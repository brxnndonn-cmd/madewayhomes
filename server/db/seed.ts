// Seed script — creates initial minimal data
// Run: bun run seed
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

async function seed() {
  const dbPath = process.env.DATABASE_PATH || './data/madewayhomes.db';
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  console.log('🌱 Seeding database...');

  // Create tables if they don't exist (failsafe if migrations haven't been run)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      name TEXT NOT NULL,
      phone TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      status TEXT NOT NULL DEFAULT 'active',
      reset_token TEXT,
      reset_token_expires TEXT
    );

    CREATE TABLE IF NOT EXISTS service_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      icon TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      lead_price_cents INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS provider_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      business_name TEXT NOT NULL,
      description TEXT,
      logo_url TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      facebook TEXT,
      instagram TEXT,
      years_in_business INTEGER,
      license_number TEXT,
      insurance_provider TEXT,
      insurance_policy_number TEXT,
      business_hours TEXT,
      approval_status TEXT NOT NULL DEFAULT 'pending_review',
      is_verified INTEGER NOT NULL DEFAULT 0,
      licensed TEXT DEFAULT 'not_applicable',
      insured TEXT DEFAULT 'no',
      credential_document_path TEXT,
      custom_other_service TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS provider_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_id INTEGER NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS service_areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_id INTEGER NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
      city TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'NC',
      zip_code TEXT
    );

    CREATE TABLE IF NOT EXISTS service_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES service_categories(id),
      city TEXT NOT NULL,
      zip_code TEXT,
      description TEXT NOT NULL,
      budget_min INTEGER,
      budget_max INTEGER,
      preferred_date TEXT,
      contact_preference TEXT DEFAULT 'email' CHECK(contact_preference IN ('phone', 'text', 'email')),
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'matched', 'in_progress', 'completed', 'canceled')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Check if already seeded
  const userCount = sqlite.prepare('SELECT COUNT(*) as count FROM users').get() as any;
  if (userCount.count > 0) {
    console.log('Database already has users — skipping seed.');
    sqlite.close();
    return;
  }

  // ── Create admin user ──────────────────────────────────────────────
  const adminPassword = crypto.randomBytes(16).toString('hex');
  const adminHash = await bcrypt.hash(adminPassword, 12);
  sqlite.prepare(`
    INSERT INTO users (email, password_hash, role, name, status)
    VALUES (?, ?, 'admin', ?, 'active')
  `).run('admin@madewayhomes.com', adminHash, 'Admin User');

  console.log('══════════════════════════════════════════');
  console.log('  ADMIN ACCOUNT');
  console.log('  Email:    admin@madewayhomes.com');
  console.log(`  Password: ${adminPassword}`);
  console.log('  ⚠️  Save this password — it will not be shown again.');
  console.log('══════════════════════════════════════════');

  // ── Create service categories ─────────────────────────────────────
  const categories = [
    { name: 'Plumbing', slug: 'plumbing', description: 'Pipe repair, leaks, fixtures, water heaters', icon: '🔧', sort: 1, price: 500 },
    { name: 'Electrical', slug: 'electrical', description: 'Wiring, outlets, panels, lighting', icon: '⚡', sort: 2, price: 500 },
    { name: 'HVAC', slug: 'hvac', description: 'Heating, cooling, ventilation, air quality', icon: '❄️', sort: 3, price: 500 },
    { name: 'Painting', slug: 'painting', description: 'Interior, exterior, trim, staining', icon: '🎨', sort: 4, price: 300 },
    { name: 'House Cleaning', slug: 'house-cleaning', description: 'Deep clean, regular maid service, move-in/out cleaning', icon: '🏡', sort: 5, price: 300 },
    { name: 'Landscaping', slug: 'landscaping', description: 'Lawn care, gardening, hardscaping, yard maintenance', icon: '🌿', sort: 6, price: 300 },
    { name: 'Roofing', slug: 'roofing', description: 'Repair, replacement, inspections', icon: '🏠', sort: 7, price: 500 },
    { name: 'Carpentry', slug: 'carpentry', description: 'Framing, trim work, custom builds', icon: '🪚', sort: 8, price: 400 },
    { name: 'Flooring', slug: 'flooring', description: 'Hardwood, tile, carpet, vinyl', icon: '🟫', sort: 9, price: 400 },
    { name: 'Moving Services', slug: 'moving', description: 'Local moving, loading, unloading, labor', icon: '📦', sort: 10, price: 400 },
    { name: 'Pest Control', slug: 'pest-control', description: 'Insects, rodents, termite treatment', icon: '🐜', sort: 11, price: 300 },
    { name: 'Handyman Services', slug: 'handyman', description: 'General repairs, assembly, odd jobs', icon: '🔨', sort: 12, price: 300 },
    { name: 'Pressure Washing', slug: 'pressure-washing', description: 'Driveways, siding, decks, patio cleaning', icon: '💦', sort: 13, price: 300 },
    { name: 'Tree Services', slug: 'tree-services', description: 'Tree trimming, removal, stump grinding, arborist', icon: '🌳', sort: 14, price: 400 },
    { name: 'Junk Removal', slug: 'junk-removal', description: 'Furniture, appliances, yard waste removal', icon: '🗑️', sort: 15, price: 300 },
    { name: 'Appliance Repair', slug: 'appliance-repair', description: 'Washer, dryer, fridge, oven, dishwasher repair', icon: '🔌', sort: 16, price: 350 },
    { name: 'Concrete Services', slug: 'concrete-services', description: 'Driveways, patios, foundations, stamped concrete', icon: '🧱', sort: 17, price: 500 },
    { name: 'General Contracting', slug: 'general-contracting', description: 'Home construction, additions, major renovations', icon: '🏗️', sort: 18, price: 600 },
    { name: 'Home Remodeling', slug: 'home-remodeling', description: 'Kitchen, bathroom, basement, whole-home remodeling', icon: '🔨', sort: 19, price: 600 },
    { name: 'Furniture Assembly', slug: 'furniture-assembly', description: 'Flat-pack furniture assembly and installation', icon: '🪑', sort: 20, price: 200 },
    { name: 'Home Organization', slug: 'home-organization', description: 'Decluttering, closet systems, garage organization', icon: '📋', sort: 21, price: 200 },
    { name: 'Rental-Property Turnover', slug: 'rental-turnover', description: 'Clean, paint, repair between tenants', icon: '🔑', sort: 22, price: 400 },
    { name: 'General Home-Service', slug: 'general-home-service', description: 'General home service requests and odd jobs', icon: '🏡', sort: 23, price: 200 },
  ];

  const insertCategory = sqlite.prepare(`
    INSERT INTO service_categories (name, slug, description, icon, sort_order, lead_price_cents)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const cat of categories) {
    insertCategory.run(cat.name, cat.slug, cat.description, cat.icon, cat.sort, cat.price);
  }
  console.log(`✅ ${categories.length} service categories created`);

  console.log('\n🎉 Seed complete!');
  console.log('   Admin account created — see password above.');
  console.log('   No demo data was created.');
  console.log('   Run `bun run seed:clear` to reset all data (keeps admin + categories).');

  sqlite.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
