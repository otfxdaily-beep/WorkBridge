# WorkBridge

WorkBridge is a real employment marketplace MVP connecting job seekers, employers and admins — job search and applications, employer job posting and applicant management, in-platform messaging, interview scheduling, a transparent (non-AI) match score, employer verification, reports/moderation, and an admin dashboard.

It launched with Abuja, Nigeria as its first market, but nothing in the schema or code hardcodes a single city or country — `Location` is a normalized lookup table, and every location-aware feature (search, matching, salary display) works the same way anywhere.

## Tech stack

- **Next.js 16** (App Router, Server Actions/Functions)
- **React 19**, **TypeScript**, **Tailwind CSS v4**
- **PostgreSQL** via **Prisma 7** (driver-adapter pattern with `@prisma/adapter-pg`)
- **Zod** for form/server-action validation
- Custom DB-backed session auth (bcrypt + hashed opaque tokens, httpOnly cookies) — no third-party auth provider
- **Vitest** for unit tests

## Prerequisites

- Node.js 24+
- A PostgreSQL server (local install or a hosted instance)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill in real values:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` — your PostgreSQL connection string. Create a dedicated database/role first, e.g.:
     ```sql
     CREATE ROLE workbridge WITH LOGIN PASSWORD 'your-password';
     CREATE DATABASE workbridge OWNER workbridge;
     ```
   - `APP_URL` — used to build links in verification/password-reset emails. `http://localhost:3000` is fine for local dev.

3. Push the schema to your database and generate the Prisma Client:

   ```bash
   npm run db:push
   ```

   > **Note:** use `db:push`, not `db:migrate`, if your project folder lives inside a cloud-synced folder (OneDrive, Dropbox, etc.). Those sync clients turn migration files into placeholder reparse points that Prisma's schema-engine binary can't always read correctly, which can produce false "no migrations found" / drift warnings. `db:push` reads `schema.prisma` directly and isn't affected. If you're on a plain local disk, `npm run db:migrate` works normally.

4. Seed reference data and demo content:

   ```bash
   npm run seed:categories   # job categories (required — the job-posting form depends on these)
   npm run seed              # a full multi-city demo dataset: employers, job seekers, jobs,
                              # applications, interviews, messages, reviews (safe to re-run)
   ```

   `npm run seed` prints the shared password for every demo account it creates, plus a couple of sample logins to try.

5. Create an admin account (admins aren't created through public registration):

   ```bash
   npm run create-admin -- admin@example.com "a-strong-password"
   ```

6. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Email

No transactional email provider is wired up yet. In development, verification and password-reset emails are logged to the server console (and the link is also shown on-screen) so those flows are fully testable without real email. See `src/lib/email.ts` — every outgoing email goes through that one function, so swapping in a real provider (Resend, SendGrid, etc.) later only requires changing it in one place.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / run |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Run the Vitest unit test suite |
| `npm run test:watch` | Vitest in watch mode |
| `npm run db:push` | Push `schema.prisma` to the database (see note above) |
| `npm run db:migrate` | Create/apply a migration (plain local disk only) |
| `npm run db:studio` | Prisma Studio — browse/edit data visually |
| `npm run seed:categories` | Upsert the job-category lookup table |
| `npm run seed` | Upsert a full multi-city demo dataset (idempotent) |
| `npm run create-admin -- <email> "<password>"` | Create an admin account |
| `npm run backfill:match-scores` | Compute match scores for any application missing one |

## Project structure

```
prisma/schema.prisma      Full data model (~30 models)
src/app/                  Routes, grouped by area: (public), dashboard (job seeker),
                           employer, admin, (auth)
src/lib/                  Business logic: auth/session, matching, notifications,
                           messaging, interviews (WAT time handling), validation/*
src/components/           Shared UI (ui/, layout/, marketing/)
src/generated/prisma/      Generated Prisma Client (custom output path, not node_modules)
scripts/                   One-off/standalone CLI scripts (seeding, admin creation,
                           backfills) — each opens its own Prisma connection
```

## Notes on the match score

Job/candidate match scores are a plain, transparent, rule-based weighted calculation (skills 40% / experience 20% / location 15% / salary 10% / title 10% / employment type 5%) — **not AI**. It's deliberately isolated in `src/lib/matching.ts` behind one `calculateMatch()` function so the scoring can change (or be replaced with something AI-assisted later) without touching any call site.

## Testing

`npm test` runs the Vitest suite — unit tests for the app's pure business logic (match scoring, WAT timezone conversion, formatters, validation schemas). It doesn't hit a database; every feature is also manually verified end-to-end in the browser as it's built.
