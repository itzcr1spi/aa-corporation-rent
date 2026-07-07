# Deploying to Vercel

First deploy = GitHub → Vercel + an EU Postgres. Everything here is portable: the
only Vercel-specific file is `vercel.json` (pins functions to Frankfurt `fra1` for
EU data residency — relevant for RODO since we'll store PESEL/IDs). Moving to
Hetzner later means dropping `vercel.json` and running `next start` / Docker.

## 1. GitHub (done)

Private repo pushed by the setup step. If you need to redo it:

```bash
gh repo create aa-corporation-rent --private --source=. --remote=origin --push
```

## 2. Provision Postgres (EU region)

The public site renders without a DB (fleet/pricing/form use fixtures), but
**reservations require Postgres**. Use an EU region for data residency.

**Option A — Neon (recommended, portable):**
1. Sign up at https://neon.tech → New Project → region **Europe (Frankfurt)**.
2. Copy the connection string (`postgres://…?sslmode=require`) → this is `DATABASE_URL`.

**Option B — Vercel Postgres:** Vercel dashboard → Storage → Create → Postgres →
region Frankfurt. It sets `DATABASE_URL` on the project automatically.

## 3. Run migrations + seed (once, against the new DB)

From your machine, pointed at the new database (never commit this URL):

```bash
DATABASE_URL="postgres://…" npm run db:migrate   # creates tables + no-double-booking constraint
DATABASE_URL="postgres://…" npm run db:seed       # fleet, fees, pickup locations (placeholder prices)
```

> `db:migrate` applies `drizzle/0001_*` which needs the `btree_gist` extension —
> Neon and Vercel Postgres both allow `CREATE EXTENSION`, so it just works.

## 4. Import to Vercel

1. https://vercel.com → **Add New → Project** → import `aa-corporation-rent`.
2. Framework preset: **Next.js** (auto-detected). No build overrides needed.
3. **Environment Variables** (Production + Preview):

   | Key                    | Value                                  | Needed for            |
   | ---------------------- | -------------------------------------- | --------------------- |
   | `DATABASE_URL`         | the Neon/Vercel Postgres URL           | reservations          |
   | `NEXT_PUBLIC_SITE_URL` | `https://<your-app>.vercel.app`        | metadata (optional)   |

   (Storage/auth/notification vars come in later phases — see `.env.example`.)
4. **Deploy.**

## 5. Verify live

- `/` (Polish) and `/en` load; `/fleet` shows the 4 cars.
- Open a car, pick dates, watch the live price update.
- Submit a booking → you get a reservation number (proves the DB + no-double-booking
  path). Check the row landed: `DATABASE_URL="…" npm run db:studio`.

## Notes

- Redeploys happen automatically on every push to `main`.
- Secrets live only in Vercel env vars + your shell — never in the repo (`.env` is
  gitignored; only `.env.example` is committed).
- Later (admin panel) you'll add `AUTH_SECRET`; (uploads) the `S3_*` vars.
