// Clear all data — removes all users, providers, requests, leads, etc.
// Keeps: admin user and service categories
// Run: bun run seed:clear
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

async function clearAllData() {
  const dbPath = process.env.DATABASE_PATH || './data/madewayhomes.db';
  if (!fs.existsSync(dbPath)) {
    console.log('No database found — nothing to clear.');
    process.exit(0);
  }

  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  console.log('🧹 Clearing all data (keeping admin + categories)...');

  // Find the admin user
  const admin = sqlite.prepare(
    "SELECT id, email FROM users WHERE role = 'admin' LIMIT 1"
  ).get() as any;

  if (!admin) {
    console.log('No admin user found — database may be empty or corrupted.');
    sqlite.close();
    process.exit(1);
  }

  console.log(`   Keeping admin: ${admin.email} (id: ${admin.id})`);

  // Delete in FK-safe order
  sqlite.exec('DELETE FROM request_images');
  sqlite.exec('DELETE FROM leads');
  sqlite.exec('DELETE FROM admin_notes');
  sqlite.exec('DELETE FROM follow_up_tasks');
  sqlite.exec('DELETE FROM notifications');
  sqlite.exec('DELETE FROM audit_logs');
  sqlite.exec('DELETE FROM reviews');
  sqlite.exec('DELETE FROM saved_providers');
  sqlite.exec('DELETE FROM payments');
  sqlite.exec('DELETE FROM subscriptions');
  sqlite.exec('DELETE FROM service_requests');
  sqlite.exec('DELETE FROM provider_services');
  sqlite.exec('DELETE FROM service_areas');
  sqlite.exec('DELETE FROM provider_images');
  sqlite.exec('DELETE FROM provider_profiles');
  sqlite.exec('DELETE FROM contact_messages');
  sqlite.exec('DELETE FROM email_signups');
  sqlite.exec('DELETE FROM discount_codes');

  // Delete all non-admin users (FK cascade handles their linked data)
  sqlite.prepare('DELETE FROM users WHERE id != ?').run(admin.id);

  // Get counts
  const stats = {
    users: (sqlite.prepare('SELECT COUNT(*) as c FROM users').get() as any).c,
    providers: (sqlite.prepare('SELECT COUNT(*) as c FROM provider_profiles').get() as any).c,
    requests: (sqlite.prepare('SELECT COUNT(*) as c FROM service_requests').get() as any).c,
    categories: (sqlite.prepare('SELECT COUNT(*) as c FROM service_categories').get() as any).c,
    leads: (sqlite.prepare('SELECT COUNT(*) as c FROM leads').get() as any).c,
    notifications: (sqlite.prepare('SELECT COUNT(*) as c FROM notifications').get() as any).c,
  };

  console.log('');
  console.log('✅ All data cleared!');
  console.log(`   Remaining users: ${stats.users}`);
  console.log(`   Remaining providers: ${stats.providers}`);
  console.log(`   Remaining requests: ${stats.requests}`);
  console.log(`   Remaining categories: ${stats.categories}`);
  console.log(`   Remaining leads: ${stats.leads}`);
  console.log(`   Remaining notifications: ${stats.notifications}`);
  console.log('');
  console.log('   To re-seed (creates admin + categories), run: bun run seed');

  sqlite.close();
}

clearAllData().catch((err) => {
  console.error('Clear failed:', err);
  process.exit(1);
});
