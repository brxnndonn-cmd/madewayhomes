import { sqlite } from './index';

// Run migrations to update database schema
export function runMigrations() {
  console.log('🔧 Running database migrations...');

  // Ensure audit_logs table exists
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      details TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Migrate: widen service_requests status CHECK constraint
  try {
    // Check if old constraint exists by testing a new status value
    try {
      sqlite.exec("UPDATE service_requests SET status = 'reviewing' WHERE 1=0");
    } catch {
      // Old constraint is in place, migrate
      console.log('  → Migrating service_requests status constraint...');
      sqlite.exec(`
        -- Create new table with widened constraint
        CREATE TABLE IF NOT EXISTS service_requests_new (
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
          status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'reviewing', 'sent_to_provider', 'contacted', 'completed', 'closed', 'matched', 'in_progress', 'canceled')),
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- Copy data
        INSERT INTO service_requests_new SELECT * FROM service_requests;

        -- Drop old, rename new
        DROP TABLE service_requests;
        ALTER TABLE service_requests_new RENAME TO service_requests;
      `);
      console.log('  ✅ service_requests status constraint widened');
    }
  } catch (e: any) {
    console.error('  ⚠️ service_requests migration error:', e.message);
  }

  // Migrate: update any 'pending' approval_status to 'pending_review'
  try {
    const result = sqlite.prepare(
      "UPDATE provider_profiles SET approval_status = 'pending_review' WHERE approval_status = 'pending'"
    ).run();
    if (result.changes > 0) {
      console.log(`  → Migrated ${result.changes} provider profiles from 'pending' to 'pending_review'`);
    }
  } catch (e: any) {
    // Table may not exist or column may not exist
  }

  console.log('✅ Migrations complete');
}
