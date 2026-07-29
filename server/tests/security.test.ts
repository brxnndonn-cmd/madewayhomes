import { describe, it, expect, beforeAll, afterAll } from 'bun:test';

// ── Start the server as a child process (uses Node.js via tsx) ─────
// better-sqlite3 is a native addon not supported by Bun's runtime,
// so we spawn the server separately and test via HTTP.
const TEST_PORT = Math.floor(Math.random() * 10000) + 50000;
let BASE_URL: string;
let serverProc: any;

async function waitForServer(url: string, maxRetries = 20): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`${url}/api/health`);
      if (res.ok) return true;
    } catch { /* server not ready yet */ }
    await new Promise(r => setTimeout(r, 300));
  }
  return false;
}

beforeAll(async () => {
  BASE_URL = `http://localhost:${TEST_PORT}`;

  serverProc = Bun.spawn(['bun', 'run', 'start'], {
    cwd: '/home/team/shared/madewayhomes',
    env: {
      ...process.env,
      API_PORT: String(TEST_PORT),
      NODE_ENV: 'production',
      JWT_SECRET: 'test-secret-for-ci',
      // Ensure DATABASE_PATH uses the main DB so seeded data is available
      DATABASE_PATH: './data/madewayhomes.db',
    },
    stdout: 'pipe',
    stderr: 'pipe',
  });

  const ready = await waitForServer(BASE_URL);
  if (!ready) {
    // Try to read stderr for diagnostics
    try {
      const errText = await new Response(serverProc.stderr).text();
      console.error('Server stderr:', errText);
    } catch {}
    throw new Error(`Server failed to start on port ${TEST_PORT}`);
  }
}, 15000);

afterAll(() => {
  serverProc?.kill();
});

// ── Test 1: Admin registration blocked ──────────────────────────────
describe('Admin registration blocked', () => {
  it('rejects role=admin with 400', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test-admin-${Date.now()}@example.com`,
        password: 'TestPass123!',
        name: 'Hacker',
        role: 'admin',
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it('allows role=customer registration', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test-customer-${Date.now()}@example.com`,
        password: 'TestPass123!',
        name: 'Jane Test',
        role: 'customer',
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user).toBeDefined();
    expect(body.user.role).toBe('customer');
  });

  it('allows role=provider registration', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test-provider-${Date.now()}@example.com`,
        password: 'TestPass123!',
        name: 'Bob Test',
        role: 'provider',
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user).toBeDefined();
    expect(body.user.role).toBe('provider');
  });
});

// ── Test 2: Credential download requires admin auth ─────────────────
describe('Credential download requires admin', () => {
  it('returns 401 without auth', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/providers/1/credential`);
    // 401 from requireAuth middleware
    expect(res.status).toBe(401);
  });
});

// ── Test 3: Public provider API returns only allowlisted fields ─────
const FORBIDDEN_FIELDS = [
  'user_id',
  'credential_document_path',
  'license_number',
  'licensed',
  'insured',
  'insurance_provider',
  'insurance_policy_number',
  'approval_status',
  'created_at',
  'updated_at',
];

describe('Public provider API — allowlisted fields only', () => {
  it('GET /api/providers returns no forbidden fields', async () => {
    const res = await fetch(`${BASE_URL}/api/providers`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.providers).toBeDefined();
    expect(Array.isArray(body.providers)).toBe(true);

    for (const provider of body.providers) {
      for (const field of FORBIDDEN_FIELDS) {
        expect(provider).not.toHaveProperty(field);
      }
    }
  });

  it('GET /api/providers/:id returns no forbidden fields', async () => {
    // First get a provider ID from the list
    const listRes = await fetch(`${BASE_URL}/api/providers`);
    const listBody = await listRes.json();
    if (listBody.providers.length === 0) {
      // No published providers, test passes vacuously
      return;
    }
    const providerId = listBody.providers[0].id;

    const res = await fetch(`${BASE_URL}/api/providers/${providerId}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.provider).toBeDefined();

    for (const field of FORBIDDEN_FIELDS) {
      expect(body.provider).not.toHaveProperty(field);
    }
  });
});

// ── Test 4: Password reset tokens hidden in production ──────────────
describe('Password reset tokens hidden in production', () => {
  it('forgot-password response does NOT contain resetToken', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'someone@example.com' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    // In production, resetToken must never appear in response
    expect(body).not.toHaveProperty('resetToken');
  });
});

// ── Test 5: Rate limiting returns 429 ───────────────────────────────
describe('Rate limiting on auth endpoints', () => {
  it('returns 429 after 5 login attempts within the window', async () => {
    const credentials = {
      email: 'nonexistent@example.com',
      password: 'wrongpassword',
    };

    // Hit the endpoint 6 times in quick succession
    // Rate limit is 5 per minute, so 6th should be 429
    const results: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      results.push(res.status);
    }

    // At least one of the last responses should be 429
    const hasRateLimit = results.some(s => s === 429);
    expect(hasRateLimit).toBe(true);
  });
});
