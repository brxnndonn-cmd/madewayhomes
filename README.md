# MadeWayHomes

**Making the way home easier.** A local home-services marketplace connecting homeowners with independent service providers in Caldwell County, North Carolina.

## What is MadeWayHomes?

MadeWayHomes is a marketing, directory, and lead-generation platform — not a brokerage. Homeowners and property owners submit service requests; we match them with approved local service providers. Providers get leads and visibility in the community.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS 3, React Router v6
- **Backend:** Express, TypeScript, SQLite (better-sqlite3), Drizzle ORM
- **Auth:** JWT (httpOnly cookies + Authorization header), bcrypt
- **Database:** SQLite with Drizzle ORM for migrations

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- Node.js 18+

### Setup

```bash
# 1. Clone and navigate to the project
cd madewayhomes

# 2. Copy environment variables
cp .env.example .env
# Edit .env with your settings (defaults work for dev)

# 3. Install dependencies
bun install

# 4. Create database and run migrations
bun run db:generate
bun run db:migrate

# 5. Seed demo data
bun run seed

# 6. Start development servers
bun run dev
```

The API server runs on **http://localhost:3001** and the Vite dev server on **http://localhost:5173**.  
The Vite dev server proxies `/api/*` requests to the Express server.

## How to Build for Production

```bash
# Build the React frontend
bun run build

# Start the production server (serves API + static frontend on port 3001)
NODE_ENV=production bun run start
```

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_PATH` | Path to SQLite database | `./data/madewayhomes.db` |
| `API_PORT` | Express server port | `3001` |
| `JWT_SECRET` | JWT signing secret | (auto-generated in dev) |
| `CLIENT_URL` | CORS origin for dev | `http://localhost:5173` |
| `EMAIL_API_KEY` | Email provider API key | (none — email stubs in dev) |
| `EMAIL_FROM` | From address for emails | `hello@madewayhomes.com` |

## Demo Credentials

After running `bun run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@madewayhomes.com | Admin123! |
| Customer | customer@example.com | Customer1! |
| Provider | provider@example.com | Provider1! |

All demo providers (marked with `[DEMO]` prefix) also use password: `Provider1!`  
All demo customers (marked with `[DEMO]` prefix) also use password: `Customer1!`

## How to Remove Demo Data

```bash
bun run seed:clear
```

This removes all `[DEMO]` prefixed users, providers, service requests, and related data, while keeping:
- Admin user
- Site settings
- Service categories
- Subscription plans
- Non-demo users (original customer and provider)

To restore demo data, run `bun run seed` again.

## Project Structure

```
madewayhomes/
├── server/                 # Express backend
│   ├── index.ts            # Server entry point
│   ├── db/                 # Database (schema, connection, migrations, seed)
│   ├── middleware/         # Auth middleware, validation
│   ├── routes/             # API routes (auth, users, admin, providers, requests)
│   ├── services/           # Notification service
│   └── utils/              # JWT helpers
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Layout, ProtectedRoute, NotificationBell, UI primitives
│   │   ├── pages/          # Home, Login, Register, RequestService, ProviderDirectory, etc.
│   │   ├── hooks/          # useAuth context
│   │   └── lib/            # API client
│   └── vite.config.ts
├── data/                   # SQLite database + uploads (gitignored)
├── migrations/             # Drizzle SQL migrations
├── package.json
└── drizzle.config.ts
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start API + Vite dev servers concurrently |
| `bun run dev:server` | Start only the Express API (tsx watch) |
| `bun run dev:client` | Start only the Vite dev server |
| `bun run build` | Build the React frontend for production |
| `bun run start` | Run production server (serves API + static) |
| `bun run db:generate` | Generate SQL migrations from Drizzle schema |
| `bun run db:migrate` | Apply pending migrations to SQLite |
| `bun run db:push` | Push schema directly to SQLite (no migration file) |
| `bun run seed` | Seed database with demo data |
| `bun run seed:clear` | Remove all demo data (keeps admin + settings) |

## API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Log in
- `POST /api/auth/logout` — Log out
- `GET /api/auth/me` — Get current user
- `POST /api/auth/forgot-password` — Request password reset
- `POST /api/auth/reset-password` — Complete password reset

### Public
- `GET /api/categories` — List active service categories
- `GET /api/providers/featured` — Featured approved providers
- `GET /api/providers` — Search/list approved providers
- `GET /api/providers/:id` — Single provider profile
- `POST /api/contact` — Submit contact form
- `POST /api/email-signup` — Newsletter signup
- `GET /api/site-settings` — All site settings

### Users
- `GET /api/users/profile` — Get profile (with provider profile if applicable)
- `PUT /api/users/profile` — Update profile
- `DELETE /api/users/account` — Soft-delete account

### Service Requests
- `POST /api/service-requests` — Submit a service request (with optional image uploads)

### Providers
- `POST /api/providers/apply` — Submit provider application (with logo + work photos)
- `GET /api/providers/me` — Get own provider profile

### Admin
- `GET /api/admin/dashboard` — Dashboard stats
- `GET /api/admin/users` — List all users
- `GET /api/admin/providers` — List all providers
- `GET /api/admin/providers/pending` — Pending provider approvals
- `POST /api/admin/providers/:id/approve` — Approve provider
- `POST /api/admin/providers/:id/reject` — Reject provider
- `GET /api/admin/requests` — List all service requests
- `PUT /api/admin/requests/:id` — Update request
- `POST /api/admin/requests/:id/match` — Match request to provider
- `GET /api/admin/requests/:id/notes` — Get request notes
- `POST /api/admin/requests/:id/notes` — Add note to request
- `GET /api/admin/contact-messages` — List contact form submissions
- `GET /api/admin/notifications` — Recent notifications
- `GET /api/admin/export/requests` — Export requests as CSV
- `GET /api/admin/export/providers` — Export providers as CSV

### Notifications
- `GET /api/notifications` — Get current user's notifications
- `GET /api/notifications/unread-count` — Unread notification count
- `PUT /api/notifications/:id/read` — Mark notification as read
- `PUT /api/notifications/read-all` — Mark all notifications as read

## Key Design Decisions

### Admin Registration
The first user to register with role "admin" is auto-approved. After an admin exists, subsequent admin registrations require an existing admin to create the account.

### Password Reset
In development, the reset token is returned directly in the API response. In production, this would be sent via email. The `/reset-password` page accepts a `?token=` query parameter.

### Database
SQLite via better-sqlite3. The database file is stored at `./data/madewayhomes.db` (configurable via `DATABASE_PATH` in `.env`). WAL mode and foreign keys are enabled.

### Email
Email notifications are implemented as stubs in development. To enable real email sending, see `EMAIL_SETUP.md`. All notifications are stored in the database and visible in-app regardless of email configuration.

### Demo Data
All demo/sample data is clearly labeled with a `[DEMO]` prefix on business names and customer names, making them instantly identifiable as fake. Run `bun run seed:clear` to remove all demo data before adding real providers and customers.

## Pre-Launch

See these files before launching:
- **`LAUNCH_CHECKLIST.md`** — Step-by-step pre-launch checklist
- **`EMAIL_SETUP.md`** — How to configure real email sending
- **`STRIPE_SETUP.md`** — How to add payment processing (future)

## License

Private — all rights reserved.
