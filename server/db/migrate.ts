// Manual migration runner for SQLite + Drizzle
// Run: bun run db:migrate
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || './data/madewayhomes.db';
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Create migrations tracking table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS __drizzle_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Get already-applied migrations
const applied = new Set(
  sqlite.prepare('SELECT name FROM __drizzle_migrations').all().map((r: any) => r.name)
);

const migrationsDir = path.resolve(import.meta.dirname, '../../migrations');
if (!fs.existsSync(migrationsDir)) {
  console.log('No migrations directory found. Run `bun run db:generate` first.');
  sqlite.close();
  process.exit(0);
}

const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

let appliedCount = 0;
for (const file of migrationFiles) {
  if (applied.has(file)) continue;

  const filePath = path.join(migrationsDir, file);
  const sql = fs.readFileSync(filePath, 'utf-8');

  console.log(`Applying migration: ${file}`);
  sqlite.exec(sql);
  sqlite.prepare('INSERT INTO __drizzle_migrations (name) VALUES (?)').run(file);
  appliedCount++;
}

if (appliedCount === 0) {
  console.log('All migrations already applied.');
} else {
  console.log(`Applied ${appliedCount} migration(s).`);
}

sqlite.close();
