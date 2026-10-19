# Sanskar Shakti — Lead Management

An inquiry/lead management app for Sanskar Shakti's Garbh Sanskar coordinators, in the visual style of [sanskarshakti.org](https://sanskarshakti.org).

- **Coordinators** log in on their phone, enter a new inquiry, and see only the leads they personally entered — landing on their Pending / On Hold list first so follow-ups don't get lost. Contact numbers have one-tap Call and WhatsApp buttons.
- **Admins** get a dashboard with monthly conversion analytics (by centre, coordinator, location, reason), a filterable/searchable table of every lead, XLSX/PDF export, and screens to manage the Centres / Coordinators / Reasons dropdown lists and login accounts. There is no public sign-up — admins create every account.

## Tech stack

Next.js 16 (App Router, TypeScript) · Prisma + PostgreSQL · Tailwind CSS v4 · Recharts · exceljs / pdfkit for export · hand-rolled email+password auth (bcrypt + signed JWT cookie).

## Local development

Requirements: Node 20+, a Postgres database (a `docker-compose.yml` is included for a local one).

```bash
docker compose up -d          # starts local Postgres on port 5433
npm install
npm run db:migrate            # creates tables (prisma migrate dev)
npm run db:seed               # seeds centres, coordinators, reasons, and the admin/demo accounts below
npm run dev
```

Copy `.env.example` to `.env` and adjust if needed — the checked-in `.env` already points at the Docker Postgres instance above for convenience in this environment. **Change `SESSION_SECRET`, `ADMIN_PASSWORD`, and `DEMO_COORDINATOR_PASSWORD` before deploying anywhere real.**

Seeded accounts (change these passwords after first login, from Admin → Users):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@sanskarshakti.org` | `ChangeMe123!` |
| Coordinator (demo) | `demo@sanskarshakti.org` | `ChangeMe123!` |

## Deploying (Vercel + Neon)

1. Create a free Postgres database at [neon.tech](https://neon.tech) (or any managed Postgres) and copy its connection string.
2. Push this repo to GitHub, then import it into [Vercel](https://vercel.com/new).
3. In the Vercel project's Environment Variables, set:
   - `DATABASE_URL` — the Neon connection string
   - `SESSION_SECRET` — a long random string (e.g. `openssl rand -hex 32`)
   - `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` — your real admin account
   - `DEMO_COORDINATOR_*` — optional, omit to skip creating a demo account
4. Run the migration against the production database once (from your machine, with `DATABASE_URL` pointed at Neon):
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```
5. Deploy. Log in as the admin account and change the password from Admin → Users.

## Editable lists

Centres, Coordinators, and Reasons for not joining are seeded from the lists Sanskar Shakti provided, but every one of them can be renamed, reordered, added to, or deactivated from **Admin → Centres / Coordinators / Reasons** — no code change needed. Deactivating (rather than deleting) keeps historical leads referencing that value intact.

## Notes

- The header uses a plain text wordmark rather than the site's actual logo image — drop in a real logo asset later if you'd like it to match exactly.
- Export buttons on **Admin → Leads** respect whatever filters are currently applied.
- **Admin → Dashboard → Print / PDF report** opens a print-optimized summary — use the browser's Save as PDF.
