// Clear demo data — removes all demo/sample data but keeps admin user and site settings
// Run: bun run seed:clear
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

async function clearDemoData() {
  const dbPath = process.env.DATABASE_PATH || './data/madewayhomes.db';
  if (!fs.existsSync(dbPath)) {
    console.log('No database found — nothing to clear.');
    process.exit(0);
  }

  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  console.log('🧹 Clearing demo data...');

  // Delete all users with [DEMO] in name or email
  const demoUsers = sqlite.prepare(
    "SELECT id, name, email FROM users WHERE name LIKE '%[DEMO]%' OR email LIKE '%demo-%'"
  ).all() as any[];

  if (demoUsers.length === 0) {
    console.log('No demo users found — database may already be clean.');
  } else {
    // Collect IDs first (foreign keys will cascade)
    const ids = demoUsers.map(u => u.id);

    // Delete in order respecting FK constraints
    for (const user of demoUsers) {
      sqlite.prepare('DELETE FROM users WHERE id = ?').run(user.id);
      console.log(`   Removed: ${user.name} (${user.email})`);
    }
  }

  // Delete demo provider profiles with [DEMO] prefix
  const demoProfiles = sqlite.prepare(
    "SELECT id, business_name FROM provider_profiles WHERE business_name LIKE '[DEMO]%'"
  ).all() as any[];

  for (const p of demoProfiles) {
    // Cascade should handle this, but be explicit
    sqlite.prepare('DELETE FROM provider_services WHERE provider_id = ?').run(p.id);
    sqlite.prepare('DELETE FROM service_areas WHERE provider_id = ?').run(p.id);
    sqlite.prepare('DELETE FROM provider_images WHERE provider_id = ?').run(p.id);
    sqlite.prepare('DELETE FROM provider_profiles WHERE id = ?').run(p.id);
    console.log(`   Removed provider profile: ${p.business_name}`);
  }

  // Delete demo service requests (all, since they were created by demo/seed users)
  const demoRequests = sqlite.prepare(
    `SELECT sr.id, sr.description FROM service_requests sr
     JOIN users u ON sr.customer_id = u.id
     WHERE u.name LIKE '%[DEMO]%' OR u.email LIKE '%demo-%'`
  ).all() as any[];

  for (const r of demoRequests) {
    sqlite.prepare('DELETE FROM service_requests WHERE id = ?').run(r.id);
  }

  // Delete demo-service-created data
  sqlite.prepare("DELETE FROM request_images WHERE request_id NOT IN (SELECT id FROM service_requests)").run();
  sqlite.prepare("DELETE FROM leads WHERE request_id NOT IN (SELECT id FROM service_requests)").run();
  sqlite.prepare("DELETE FROM admin_notes WHERE target_id NOT IN (SELECT id FROM service_requests) AND target_type = 'request'").run();
  sqlite.prepare("DELETE FROM notifications WHERE user_id NOT IN (SELECT id FROM users)").run();
  sqlite.prepare("DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE name LIKE '%[DEMO]%' OR email LIKE '%demo-%')").run();
  sqlite.prepare("DELETE FROM audit_logs WHERE user_id NOT IN (SELECT id FROM users)").run();

  // Keep: admin, original provider, original customer, categories, plans, settings
  // Also keep: provider_profiles and users NOT matching [DEMO] patterns
  console.log('');
  console.log('✅ Demo data cleared!');
  console.log('   Kept: admin user, site settings, service categories, subscription plans');
  console.log('   Also kept: non-demo users/providers (Bob\'s Home Repairs, Jane Homeowner)');
  console.log('');
  console.log('   To restore demo data, run: bun run seed');

  sqlite.close();
}

clearDemoData().catch((err) => {
  console.error('Clear failed:', err);
  process.exit(1);
});
