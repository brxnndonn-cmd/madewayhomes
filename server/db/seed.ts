// Seed script — creates initial demo data
// Run: bun run seed
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
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

  // Check if already seeded
  const userCount = sqlite.prepare('SELECT COUNT(*) as count FROM users').get() as any;
  if (userCount.count > 0) {
    console.log('Database already has users — skipping seed.');
    sqlite.close();
    return;
  }

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

    CREATE TABLE IF NOT EXISTS subscription_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      price_cents_monthly INTEGER NOT NULL DEFAULT 0,
      features TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
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
      approval_status TEXT NOT NULL DEFAULT 'pending',
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

  // ── Create admin user ──────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin123!', 12);
  sqlite.prepare(`
    INSERT INTO users (email, password_hash, role, name, status)
    VALUES (?, ?, 'admin', ?, 'active')
  `).run('admin@madewayhomes.com', adminHash, 'Admin User');
  console.log('✅ Admin user created (admin@madewayhomes.com / Admin123!)');

  // ── Create demo customers ──────────────────────────────────────────
  const customerHash = await bcrypt.hash('Customer1!', 12);

  const demoCustomers = [
    { email: 'customer@example.com', name: 'Jane Homeowner', phone: '828-555-0101' },
    { email: 'demo-john@example.com', name: '[DEMO] John Smith', phone: '828-555-0111' },
    { email: 'demo-mary@example.com', name: '[DEMO] Mary Davis', phone: '828-555-0112' },
    { email: 'demo-robert@example.com', name: '[DEMO] Robert Wilson', phone: '828-555-0113' },
    { email: 'demo-susan@example.com', name: '[DEMO] Susan Brown', phone: '828-555-0114' },
    { email: 'demo-mike@example.com', name: '[DEMO] Mike Johnson', phone: '828-555-0115' },
    { email: 'demo-linda@example.com', name: '[DEMO] Linda Martinez', phone: '828-555-0116' },
  ];

  const customerIds: number[] = [];
  for (const cust of demoCustomers) {
    const result = sqlite.prepare(`
      INSERT INTO users (email, password_hash, role, name, phone, status)
      VALUES (?, ?, 'customer', ?, ?, 'active')
    `).run(cust.email, customerHash, cust.name, cust.phone);
    customerIds.push(result.lastInsertRowid as number);
  }

  console.log(`✅ ${demoCustomers.length} demo customers created (all use password: Customer1!)`);

  // ── Create demo providers ──────────────────────────────────────────
  const providerHash = await bcrypt.hash('Provider1!', 12);

  const demoProviders = [
    {
      user_email: 'provider@example.com',
      user_name: 'Bob Builder',
      user_phone: '828-555-0202',
      business_name: "Bob's Home Repairs",
      description: 'Trusted handyman and home repair services in Caldwell County. Over 10 years of experience serving local homeowners.',
      phone: '828-555-0202',
      email: 'bob@bobsrepairs.example.com',
      website: 'https://bobsrepairs.example.com',
      years: 10,
      status: 'approved',
      categories: [1, 4, 8, 12], // plumbing, painting, carpentry, handyman
      areas: ['Lenoir', 'Granite Falls'],
    },
    {
      user_email: 'demo-provider2@example.com',
      user_name: '[DEMO] Carlos Ruiz',
      user_phone: '828-555-0301',
      business_name: '[DEMO] GreenView Landscaping',
      description: 'Premium lawn care and landscaping services for residential and commercial properties in Caldwell County. We specialize in lawn maintenance, hardscaping, and garden design.',
      phone: '828-555-0301',
      email: 'carlos@greenview.example.com',
      website: 'https://greenview.example.com',
      years: 7,
      status: 'approved',
      categories: [5, 6, 13], // cleaning, landscaping, lawn-care
      areas: ['Lenoir', 'Hudson', 'Granite Falls', 'Gamewell'],
    },
    {
      user_email: 'demo-provider3@example.com',
      user_name: '[DEMO] Sarah Mitchell',
      user_phone: '828-555-0401',
      business_name: '[DEMO] Sparkle & Shine Cleaning',
      description: 'Professional house cleaning and property cleaning services. We offer deep cleans, move-in/move-out cleaning, and recurring maid service throughout Caldwell County.',
      phone: '828-555-0401',
      email: 'sarah@sparkleshine.example.com',
      website: 'https://sparkleshine.example.com',
      years: 5,
      status: 'approved',
      categories: [5, 15, 16], // cleaning, house-cleaning, property-cleaning
      areas: ['Lenoir', 'Granite Falls', 'Sawmills'],
    },
    {
      user_email: 'demo-provider4@example.com',
      user_name: '[DEMO] Dave Thompson',
      user_phone: '828-555-0501',
      business_name: '[DEMO] Blue Ridge Pressure Wash',
      description: 'Expert pressure washing for homes, driveways, decks, and commercial properties. Restore your property\'s appearance with our professional-grade equipment and eco-friendly solutions.',
      phone: '828-555-0501',
      email: 'dave@blueridgepw.example.com',
      website: 'https://blueridgepw.example.com',
      years: 4,
      status: 'pending',
      categories: [4, 14], // painting, pressure-washing
      areas: ['Lenoir', 'Hudson', 'Gamewell'],
    },
    {
      user_email: 'demo-provider5@example.com',
      user_name: '[DEMO] Lisa Nguyen',
      user_phone: '828-555-0601',
      business_name: '[DEMO] Caldwell Moving Co.',
      description: 'Reliable local moving and junk removal services. We handle furniture assembly, home organization, and rental-property turnover with care and efficiency.',
      phone: '828-555-0601',
      email: 'lisa@caldwellmoving.example.com',
      website: null,
      years: 3,
      status: 'pending',
      categories: [10, 17, 18, 19, 20, 22], // moving, junk-removal, furniture-assembly, home-organization, moving-assistance, rental-turnover
      areas: ['Lenoir', 'Granite Falls', 'Hudson', 'Sawmills', 'Gamewell'],
    },
    {
      user_email: 'demo-provider6@example.com',
      user_name: '[DEMO] Tom Harris',
      user_phone: '828-555-0701',
      business_name: '[DEMO] Lenoir Handyman Pros',
      description: 'Your go-to team for all handyman services, painting, and general home repairs. No job is too small — from fixing a leaky faucet to painting your entire interior.',
      phone: '828-555-0701',
      email: 'tom@lenoirhandyman.example.com',
      website: 'https://lenoirhandyman.example.com',
      years: 8,
      status: 'approved',
      categories: [4, 8, 12, 20], // painting, carpentry, handyman, furniture-assembly
      areas: ['Lenoir', 'Granite Falls'],
    },
    {
      user_email: 'demo-provider7@example.com',
      user_name: '[DEMO] Rachel Kim',
      user_phone: '828-555-0801',
      business_name: '[DEMO] Fresh Look Detailing',
      description: 'Mobile car detailing services across Caldwell County. We bring professional auto detailing to your doorstep — interior, exterior, and full-service packages.',
      phone: '828-555-0801',
      email: 'rachel@freshlook.example.com',
      website: null,
      years: 2,
      status: 'pending',
      categories: [4, 21], // painting, mobile-car-detailing
      areas: ['Lenoir', 'Hudson', 'Sawmills'],
    },
    {
      user_email: 'demo-provider8@example.com',
      user_name: '[DEMO] James Walker',
      user_phone: '828-555-0901',
      business_name: '[DEMO] Foothills Real Estate Photo',
      description: 'Professional real estate photography and rental-property photography. High-quality images that help your property stand out. Serving Lenoir and all Caldwell County.',
      phone: '828-555-0901',
      email: 'james@foothillsphoto.example.com',
      website: 'https://foothillsphoto.example.com',
      years: 6,
      status: 'approved',
      categories: [23, 22], // real-estate-photography, rental-turnover
      areas: ['Lenoir', 'Granite Falls', 'Hudson', 'Gamewell', 'Sawmills'],
    },
  ];

  const providerUserIds: number[] = [];

  for (const dp of demoProviders) {
    const result = sqlite.prepare(`
      INSERT INTO users (email, password_hash, role, name, phone, status)
      VALUES (?, ?, 'provider', ?, ?, 'active')
    `).run(dp.user_email, providerHash, dp.user_name, dp.user_phone);
    const userId = result.lastInsertRowid as number;
    providerUserIds.push(userId);

    const profileResult = sqlite.prepare(`
      INSERT INTO provider_profiles (user_id, business_name, description, phone, email, website, years_in_business, approval_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, dp.business_name, dp.description, dp.phone, dp.email, dp.website, dp.years, dp.status);

    const providerId = profileResult.lastInsertRowid as number;

    // Insert provider services
    for (const catId of dp.categories) {
      sqlite.prepare(`
        INSERT INTO provider_services (provider_id, category_id)
        VALUES (?, ?)
      `).run(providerId, catId);
    }

    // Insert service areas
    for (const city of dp.areas) {
      sqlite.prepare(`
        INSERT INTO service_areas (provider_id, city, state)
        VALUES (?, ?, 'NC')
      `).run(providerId, city);
    }
  }

  console.log(`✅ ${demoProviders.length} demo providers created (all use password: Provider1!)`);
  console.log(`   Approved: ${demoProviders.filter(p => p.status === 'approved').length}, Pending: ${demoProviders.filter(p => p.status === 'pending').length}`);

  // ── Create service categories ─────────────────────────────────────
  // Merge original categories with MVP owner-specified categories
  const categories = [
    // Original set
    { name: 'Plumbing', slug: 'plumbing', description: 'Pipe repair, leaks, fixtures, water heaters', icon: '🔧', sort: 1, price: 500 },
    { name: 'Electrical', slug: 'electrical', description: 'Wiring, outlets, panels, lighting', icon: '⚡', sort: 2, price: 500 },
    { name: 'HVAC', slug: 'hvac', description: 'Heating, cooling, ventilation, air quality', icon: '❄️', sort: 3, price: 500 },
    { name: 'Painting', slug: 'painting', description: 'Interior, exterior, trim, staining', icon: '🎨', sort: 4, price: 300 },
    { name: 'Cleaning', slug: 'cleaning', description: 'General cleaning services', icon: '🧹', sort: 5, price: 300 },
    { name: 'Landscaping', slug: 'landscaping', description: 'Lawn care, gardening, hardscaping', icon: '🌿', sort: 6, price: 300 },
    { name: 'Roofing', slug: 'roofing', description: 'Repair, replacement, inspections', icon: '🏠', sort: 7, price: 500 },
    { name: 'Carpentry', slug: 'carpentry', description: 'Framing, trim work, custom builds', icon: '🪚', sort: 8, price: 400 },
    { name: 'Flooring', slug: 'flooring', description: 'Hardwood, tile, carpet, vinyl', icon: '🟫', sort: 9, price: 400 },
    { name: 'Moving', slug: 'moving', description: 'Local moving, loading, unloading', icon: '📦', sort: 10, price: 400 },
    { name: 'Pest Control', slug: 'pest-control', description: 'Insects, rodents, termite treatment', icon: '🐜', sort: 11, price: 300 },
    { name: 'Handyman', slug: 'handyman', description: 'General repairs, assembly, odd jobs', icon: '🔨', sort: 12, price: 300 },
    // MVP owner-specified additions
    { name: 'Lawn Care', slug: 'lawn-care', description: 'Mowing, trimming, fertilizing, yard cleanup', icon: '🌱', sort: 13, price: 300 },
    { name: 'Pressure Washing', slug: 'pressure-washing', description: 'Driveways, siding, decks, patio cleaning', icon: '💦', sort: 14, price: 300 },
    { name: 'House Cleaning', slug: 'house-cleaning', description: 'Deep clean, regular maid service, move-in/out', icon: '🏡', sort: 15, price: 300 },
    { name: 'Property Cleaning', slug: 'property-cleaning', description: 'Commercial and rental property cleaning', icon: '🧼', sort: 16, price: 300 },
    { name: 'Junk Removal', slug: 'junk-removal', description: 'Furniture, appliances, yard waste removal', icon: '🗑️', sort: 17, price: 300 },
    { name: 'Furniture Assembly', slug: 'furniture-assembly', description: 'Flat-pack furniture assembly and installation', icon: '🪑', sort: 18, price: 200 },
    { name: 'Home Organization', slug: 'home-organization', description: 'Decluttering, closet systems, garage organization', icon: '📋', sort: 19, price: 200 },
    { name: 'Moving Assistance', slug: 'moving-assistance', description: 'Loading help, local moves, labor only', icon: '🚛', sort: 20, price: 350 },
    { name: 'Mobile Car Detailing', slug: 'mobile-car-detailing', description: 'On-site auto detailing at your location', icon: '🚗', sort: 21, price: 250 },
    { name: 'Rental-Property Turnover', slug: 'rental-turnover', description: 'Clean, paint, repair between tenants', icon: '🔑', sort: 22, price: 400 },
    { name: 'Real Estate Photography', slug: 'real-estate-photography', description: 'Professional listing photos and drone shots', icon: '📷', sort: 23, price: 350 },
    { name: 'General Home-Service', slug: 'general-home-service', description: 'General home service requests and odd jobs', icon: '🏡', sort: 24, price: 200 },
  ];

  const insertCategory = sqlite.prepare(`
    INSERT INTO service_categories (name, slug, description, icon, sort_order, lead_price_cents)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const cat of categories) {
    insertCategory.run(cat.name, cat.slug, cat.description, cat.icon, cat.sort, cat.price);
  }
  console.log(`✅ ${categories.length} service categories created`);

  // ── Create subscription plans ─────────────────────────────────────
  const plans = [
    {
      name: 'Free Listing',
      slug: 'free-listing',
      price: 0,
      features: JSON.stringify(['Basic profile in directory', 'Receive lead notifications', 'Up to 5 photos']),
      sort: 1,
    },
    {
      name: 'Featured Listing',
      slug: 'featured-listing',
      price: 4900,
      features: JSON.stringify(['Everything in Free', 'Priority placement in search results', 'Highlighted profile with badge', 'Up to 10 photos', 'Featured on category pages']),
      sort: 2,
    },
    {
      name: 'Premium Partner',
      slug: 'premium-partner',
      price: 9900,
      features: JSON.stringify(['Everything in Featured', 'Top of search results', 'Featured on homepage', 'Priority lead matching', 'Premium Partner badge', 'Unlimited photos', 'Dedicated support']),
      sort: 3,
    },
  ];

  const insertPlan = sqlite.prepare(`
    INSERT INTO subscription_plans (name, slug, price_cents_monthly, features, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const plan of plans) {
    insertPlan.run(plan.name, plan.slug, plan.price, plan.features, plan.sort);
  }
  console.log(`✅ ${plans.length} subscription plans created`);

  // ── Create site settings ─────────────────────────────────────────
  const settings = [
    { key: 'site_name', value: 'MadeWayHomes' },
    { key: 'tagline', value: 'Making the way home easier.' },
    { key: 'service_area', value: 'Caldwell County, NC' },
    { key: 'contact_email', value: 'hello@madewayhomes.com' },
  ];

  const insertSetting = sqlite.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)');
  for (const s of settings) {
    insertSetting.run(s.key, s.value);
  }
  console.log(`✅ ${settings.length} site settings created`);

  // ── Create service requests ──────────────────────────────────────
  // customerIds indices: 0=Jane, 1=John, 2=Mary, 3=Robert, 4=Susan, 5=Mike, 6=Linda
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString().split('T')[0];

  const requests = [
    {
      customer_id: customerIds[1], // John Smith
      category_id: 13, // Lawn Care
      city: 'Lenoir',
      zip_code: '28645',
      description: 'Need bi-weekly lawn mowing and trimming for my corner lot. The yard is about half an acre and has several flower beds that need edging.',
      budget_min: 50,
      budget_max: 100,
      preferred_date: daysAgo(-3),
      contact_preference: 'phone',
      status: 'new',
    },
    {
      customer_id: customerIds[2], // Mary Davis
      category_id: 15, // House Cleaning
      city: 'Granite Falls',
      zip_code: '28630',
      description: 'Looking for a deep clean of my 3-bedroom house before the holidays. Includes kitchen, bathrooms, floors, and windows.',
      budget_min: 150,
      budget_max: 300,
      preferred_date: daysAgo(-7),
      contact_preference: 'email',
      status: 'matched',
    },
    {
      customer_id: customerIds[3], // Robert Wilson
      category_id: 14, // Pressure Washing
      city: 'Hudson',
      zip_code: '28638',
      description: 'Need my 2-story vinyl-sided house pressure washed, plus the driveway and back patio. The siding has some green mildew on the north side.',
      budget_min: 200,
      budget_max: 400,
      preferred_date: daysAgo(-5),
      contact_preference: 'text',
      status: 'in_progress',
    },
    {
      customer_id: customerIds[4], // Susan Brown
      category_id: 17, // Junk Removal
      city: 'Lenoir',
      zip_code: '28645',
      description: 'Old couch, broken washing machine, and assorted garage clutter need to be hauled away. Items are in the garage, easy access.',
      budget_min: 80,
      budget_max: 200,
      preferred_date: daysAgo(-10),
      contact_preference: 'phone',
      status: 'completed',
    },
    {
      customer_id: customerIds[5], // Mike Johnson
      category_id: 4, // Painting
      city: 'Gamewell',
      zip_code: '28645',
      description: 'Interior painting for living room and hallway — approximately 600 sq ft of wall space. Walls are currently off-white, want to go to a light gray.',
      budget_min: 400,
      budget_max: 800,
      preferred_date: daysAgo(-2),
      contact_preference: 'email',
      status: 'new',
    },
    {
      customer_id: customerIds[6], // Linda Martinez
      category_id: 12, // Handyman
      city: 'Sawmills',
      zip_code: '28667',
      description: 'Need a ceiling fan installed in the master bedroom (wiring already in place), plus a couple of curtain rods hung and a squeaky door fixed.',
      budget_min: 50,
      budget_max: 150,
      preferred_date: daysAgo(-1),
      contact_preference: 'text',
      status: 'new',
    },
    {
      customer_id: customerIds[1], // John Smith (second request)
      category_id: 22, // Rental-Property Turnover
      city: 'Lenoir',
      zip_code: '28645',
      description: 'Need a full rental unit turnover clean and light repairs between tenants. 1-bedroom apartment, includes cleaning, wall touch-up paint, and minor fixes.',
      budget_min: 250,
      budget_max: 500,
      preferred_date: daysAgo(-14),
      contact_preference: 'email',
      status: 'completed',
    },
    {
      customer_id: customerIds[2], // Mary Davis (second request)
      category_id: 18, // Furniture Assembly
      city: 'Hudson',
      zip_code: '28638',
      description: 'IKEA PAX wardrobe system — 3 units — needs assembly. Also a dining table and 6 chairs from Wayfair.',
      budget_min: 100,
      budget_max: 250,
      preferred_date: daysAgo(-4),
      contact_preference: 'phone',
      status: 'matched',
    },
    {
      customer_id: customerIds[4], // Susan Brown
      category_id: 21, // Mobile Car Detailing
      city: 'Granite Falls',
      zip_code: '28630',
      description: 'Full interior and exterior detail for my Honda CR-V. Needs shampoo on the seats, there are some coffee stains.',
      budget_min: 150,
      budget_max: 250,
      preferred_date: daysAgo(-1),
      contact_preference: 'phone',
      status: 'new',
    },
    {
      customer_id: customerIds[3], // Robert Wilson
      category_id: 6, // Landscaping
      city: 'Lenoir',
      zip_code: '28645',
      description: 'Front yard landscaping refresh — new mulch, trim overgrown bushes, plant some small shrubs along the walkway. Area is about 300 sq ft.',
      budget_min: 300,
      budget_max: 600,
      preferred_date: daysAgo(-6),
      contact_preference: 'email',
      status: 'canceled',
    },
  ];

  const insertRequest = sqlite.prepare(`
    INSERT INTO service_requests (customer_id, category_id, city, zip_code, description, budget_min, budget_max, preferred_date, contact_preference, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const req of requests) {
    insertRequest.run(
      req.customer_id, req.category_id, req.city, req.zip_code,
      req.description, req.budget_min, req.budget_max,
      req.preferred_date, req.contact_preference, req.status
    );
  }
  console.log(`✅ ${requests.length} service requests created`);
  console.log(`   New: ${requests.filter(r => r.status === 'new').length}, Matched: ${requests.filter(r => r.status === 'matched').length}, In Progress: ${requests.filter(r => r.status === 'in_progress').length}, Completed: ${requests.filter(r => r.status === 'completed').length}, Canceled: ${requests.filter(r => r.status === 'canceled').length}`);

  console.log('\n🎉 Seed complete! Here are your demo accounts:');
  console.log('   Admin:    admin@madewayhomes.com / Admin123!');
  console.log('   Customer: customer@example.com / Customer1!');
  console.log('   Provider: provider@example.com / Provider1!');
  console.log('');
  console.log('   All demo providers: Provider1!');
  console.log('   All demo customers: Customer1!');
  console.log('');
  console.log('   🔹 [DEMO] prefixed accounts and businesses are sample data.');
  console.log('   🔹 Run `bun run seed:clear` to remove all demo data (keeps admin + settings).');

  sqlite.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
