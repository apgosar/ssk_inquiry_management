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

The Vercel build (`vercel-build` in package.json) runs `prisma migrate deploy`, then the seed, then `next build`. You never need to run migrations from your own machine. The seed is safe to re-run: it only fills empty tables and only creates an admin if none exists, so edits made in the admin screens are never overwritten.

1. Create a free Postgres database at [neon.tech](https://neon.tech). From **Connect**, copy two strings: the **pooled** one (host contains `-pooler`) and the **direct** one (untick connection pooling). Append `&connect_timeout=30` to both so a sleeping database has time to wake.
2. Push this repo to GitHub and import it into [Vercel](https://vercel.com/new).
3. Set these Environment Variables before the first deploy:
   - `DATABASE_URL` — the pooled Neon string (used by the running app)
   - `DIRECT_URL` — the direct Neon string (used only for migrations)
   - `SESSION_SECRET` — a long random string
   - `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` — your first admin account
   - `DEMO_COORDINATOR_*` — optional; omit to skip the demo account
4. Deploy, then log in as the admin and create coordinator accounts under Admin → Users.

After the first successful deploy you can remove `ADMIN_PASSWORD` from Vercel; it is only read while no admin exists.

## Editable lists

Centres, Coordinators, and Reasons for not joining are seeded from the lists Sanskar Shakti provided, but every one of them can be renamed, reordered, added to, or deactivated from **Admin → Centres / Coordinators / Reasons** — no code change needed. Deactivating (rather than deleting) keeps historical leads referencing that value intact.

## Notes

- The header uses a plain text wordmark rather than the site's actual logo image — drop in a real logo asset later if you'd like it to match exactly.
- Export buttons on **Admin → Leads** respect whatever filters are currently applied.
- **Admin → Dashboard → Print / PDF report** opens a print-optimized summary — use the browser's Save as PDF.
