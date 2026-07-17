# Handoff — A&A Corporation Rent (self-hosting on Ubuntu)

**You are a Claude Code session running on the client's Ubuntu server.** You do NOT
have the prior chat history — this file plus `README.md`, `DEPLOY.md`, and
`SECURITY.md` are your source of truth. Read all four before acting. The immediate
job is to **migrate this app off Vercel onto this server**. Work in small steps,
commit often, and keep the security rules in §4 at all times.

---

## 1. What this project is

Booking-first website for **A&A Corporation — Premium Car Rental (Warsaw)**. A
self-service **reservation** system (no online payment in this MVP): pick a car →
choose dates & pickup → get an automatic price → enter details → send a request →
admin confirms → pick up. Two surfaces: a public site (PL/EN) and — not built yet —
an admin panel. Visual identity: dark, cinematic, Ferrari-flavored; brand palette
black `#000` / red `#ED1C24` / silver `#C0C0C0` / white; Raleway + Montserrat.

## 2. Tech stack & key facts

- **Next.js 16 (App Router) + TypeScript + Tailwind v4 + Framer Motion.**
- **i18n:** next-intl. **Polish is default at `/`**, English at `/en`
  (`localeDetection:false` — `/` is always PL). Middleware is `src/proxy.ts`.
- **DB:** PostgreSQL + Drizzle ORM, behind `src/lib/db` (`getDb()`). Money is stored
  as integer **grosze** (never floats). **No-double-booking is enforced in the DB**
  by a GiST `EXCLUDE` constraint (`drizzle/0001_*`, needs the `btree_gist` extension).
- **Storage:** behind `src/lib/storage` (interface + local-disk driver). S3 driver is
  a later phase (uploads are deferred — see §3).
- **Portable by design:** `output: 'standalone'` in `next.config.ts`, a `Dockerfile`,
  and no Vercel-proprietary APIs in business logic. The only Vercel-specific file is
  `vercel.json` (region pin) — ignored off-Vercel.
- **Renders without a DB:** fleet, prices and the booking form work off fixtures
  (`src/lib/fleet/data.ts`, `src/lib/booking/fees.ts`); only reservation *submit*
  needs Postgres. So the site never hard-fails if the DB is down.

## 3. Current state

**Built (Phases 1–4):** design system + i18n; fleet listing + car detail + homepage
"models" showcase; booking flow + live price calculator + DB-enforced no-double-booking;
client details form (name, email, phone, DOB, address, licence — validated, no uploads);
pages: `/about` (O nas), `/how-it-works` (Jak to działa), `/contact` (Kontakt).
Currently deployed on Vercel (public site; **DB was skipped there**, so submit shows
"connect a database").

**Built (Phase 5–6 — admin panel + legal):** Auth.js credentials login (no public
signup; argon2id; account lockout; audit log) at `/admin`; **reservations** (list/
filter/detail + status workflow that fires the DB no-double-booking EXCLUDE on
confirm), **cennik** (edit model prices, fees, pickup fees), **fleet CRUD** (models +
physical units, reference-gated delete), **audit-log viewer**. Public: **/regulamin**
and **/polityka-prywatnosci** (PL+EN, footer-linked) and a **RODO cookie banner**.
Admin is Polish-only. Every admin mutation calls `requireAdmin()` + Zod + writes audit.

**Deferred / not built:** online payment (intentionally skipped); **document uploads +
PESEL/passport** (deferred until private storage + field encryption + a RODO basis
exist — see SECURITY.md); contract PDF + SMS acceptance; email/SMS notifications;
per-IP login rate-limiting and 2FA (schema reserved) — see SECURITY.md open items.

**Placeholders needing real values from the client:** car prices & deposits
(`src/lib/fleet/data.ts`), extra fees & pickup fees (`src/lib/booking/fees.ts`),
company legal data, opening hours & office address (`Contact` messages / `src/lib/config/site.ts`),
domain (`aacorporation.pl` not purchased yet), remaining car photos.

## 4. Security — non-negotiables (apply to every change)

Full posture in `SECURITY.md`. The standing rules:

- **Never trust the client.** Recompute every price/date/status server-side; ignore any
  price a request contains. `computeQuote()` in `src/lib/booking/pricing.ts` is the only
  price of record.
- **Authorization, not just authentication** — check ownership of every resource ID on
  the server (IDOR is the top risk). Non-guessable IDs (UUID) but never rely on that alone.
- **Validate all input at the boundary with Zod** before business logic (see
  `src/lib/booking/schema.ts`).
- **Secrets never in the repo.** `.env` is gitignored; only `.env.example` is committed.
  Nothing sensitive in `NEXT_PUBLIC_*`. If a secret leaks into a commit, rotate it.
- **Fail closed and quietly** — generic error to the user, detail to logs; never leak
  stack traces / SQL.
- **Double-booking is a DB constraint**, not an app check. Do not weaken it.
- **Before building a feature:** write a 3–5 line threat model. **After:** a short
  attacker walk-through. Flag anything legally risky (esp. RODO / personal data) instead
  of silently implementing it.

---

## 5. MIGRATE Vercel → this Ubuntu server

Goal: run the app + Postgres on this box, behind HTTPS, auto-restarting. Two paths —
**Docker Compose (recommended, one stack)** or **bare Node + systemd**. Use Docker unless
the client prefers otherwise.

### 5.1 Server prep

```bash
sudo apt update && sudo apt -y upgrade
# Docker + compose plugin
sudo apt -y install ca-certificates curl git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"   # re-login after this
# Firewall
sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw --force enable
```

For the **bare-Node** path also install Node 22 LTS (`nvm install 22`) — the build needs
Node ≥ 20 and **internet access at build time** (next/font fetches Raleway/Montserrat from
Google Fonts during `npm run build`).

### 5.2 Get the code (private repo)

The repo is private (`itzcr1spi/aa-corporation-rent`). Give this server read access one of:
- `gh auth login` (GitHub CLI) on the server, then `gh repo clone itzcr1spi/aa-corporation-rent`, **or**
- add a **read-only deploy key**: `ssh-keygen -t ed25519 -f ~/.ssh/aa_deploy`, add the
  `.pub` to the repo's *Deploy keys* on GitHub, then `git clone git@github.com:itzcr1spi/aa-corporation-rent.git`.

```bash
cd ~ && git clone <repo> aa-rental && cd aa-rental
```

### 5.3 Configure env

Create `.env` on the server (never commit it). Minimum for now:

```
POSTGRES_PASSWORD=<generate: openssl rand -base64 24>
SITE_DOMAIN=aacorporation.pl        # or a temp subdomain you control, or the server IP for testing
SITE_URL=https://aacorporation.pl
DATABASE_URL=postgres://aa:<POSTGRES_PASSWORD>@localhost:5432/aa_rental
AUTH_SECRET=<generate: openssl rand -base64 32>   # REQUIRED — signs admin sessions
```

`AUTH_SECRET` is now required (the admin panel exists) — Auth.js will refuse to start
without it. `.env.example` documents every variable. Later phases add `S3_*` (uploads →
Hetzner Object Storage or self-hosted MinIO), `RESEND_API_KEY` / `SMSAPI_TOKEN`
(notifications).

### 5.4 Bring up the stack (Docker path — recommended)

`docker-compose.prod.yml` (in the repo) runs **postgres + app (built from the Dockerfile)
+ Caddy (auto-HTTPS reverse proxy)**. `Caddyfile` proxies your domain to the app.

```bash
# 1) start Postgres first (exposed on 127.0.0.1:5432 for migrations)
docker compose -f docker-compose.prod.yml up -d db

# 2) run migrations + seed from the host (needs Node + `npm ci` once)
npm ci
export $(grep -v '^#' .env | xargs)     # load DATABASE_URL etc.
npm run db:migrate    # creates ALL tables incl. admins + audit_log + the no-double-booking EXCLUDE
npm run db:seed       # fleet, fees, pickup locations (PLACEHOLDER prices)
npm run admin:create  # interactive — creates the first admin login for /admin (needs DATABASE_URL)

# 3) build + start the app and Caddy
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f app
```

> `btree_gist` ships with the official `postgres` image, so the EXCLUDE migration just
> works. (On bare apt-Postgres you'd need `postgresql-contrib`.)

Caddy obtains a Let's Encrypt cert automatically **once `SITE_DOMAIN` resolves to this
server's public IP** (see §5.6). For pre-DNS testing, set `SITE_DOMAIN=:80` in `.env` to
serve plain HTTP, or use the server IP.

### 5.5 Bare-Node alternative (no Docker)

```bash
npm ci && npm run build                    # produces .next/standalone
# copy static assets next to the standalone server:
cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public
# run migrations/seed as in §5.4 step 2, then:
PORT=3000 HOSTNAME=127.0.0.1 node .next/standalone/server.js
```

Wrap it in a **systemd** unit (`/etc/systemd/system/aa-rental.service`) with
`Restart=always`, `EnvironmentFile=/home/<user>/aa-rental/.env`, and put **Caddy or Nginx**
in front for TLS (Caddy: `reverse_proxy 127.0.0.1:3000`). Run Postgres via Docker or apt.

### 5.6 DNS / domain

Point the domain's **A record** (and `www` CNAME) at this server's public IP. Until
`aacorporation.pl` is bought, use a subdomain you control (or `nip.io`/the raw IP for
testing). TLS is automatic once DNS resolves (Caddy) or via Certbot (Nginx).

### 5.7 Verify (same checks as always)

- `https://<domain>/` loads in **Polish**; `/en` in English; `/fleet` shows 4 cars.
- Open a car → pick dates → the **live price** updates → fill the form → **submit** →
  you get a reservation number (proves DB + no-double-booking).
- Confirm it landed: `npm run db:studio` (or `psql`). Re-submitting overlapping
  **confirmed** dates for the same car unit must be rejected by the DB.
- Check response headers include `content-security-policy`, `strict-transport-security`,
  `x-frame-options: DENY` (these come from `next.config.ts` and still apply here).
- `/admin` redirects to `/admin/login`; log in with the `admin:create` account, confirm a
  pending reservation, and check the change shows in **Dziennik zdarzeń** (audit log).

### 5.8 Backups & ops

- **DB backup** (cron): `docker compose -f docker-compose.prod.yml exec -T db pg_dump -U aa aa_rental | gzip > backup-$(date +%F).sql.gz`.
- **Restart policy:** compose uses `restart: unless-stopped`; the box survives reboots.
- **Logs:** `docker compose ... logs`. (On Vercel these were platform-managed — now yours.)

### 5.9 Redeploys (no more auto-deploy)

On Vercel, every push auto-deployed. Here it's manual (or add CI later):

```bash
git pull
npm ci && npm run db:migrate            # apply any new migrations
docker compose -f docker-compose.prod.yml up -d --build app
```

Optionally add a GitHub Action that SSHes in and runs the above on push to `main`.

### 5.10 What changed vs Vercel (make sure each is handled)

| Concern | On Vercel | On this server |
| --- | --- | --- |
| TLS / HTTPS | automatic | **Caddy** (auto Let's Encrypt) or Certbot |
| Security headers | from `next.config.ts` | same — still emitted by the app ✓ |
| Region / data residency | `vercel.json` `fra1` | the server's location (keep it EU for RODO) |
| Auto-deploy on push | built-in | manual (§5.9) or a CI workflow |
| DDoS / edge | platform | your firewall / reverse proxy / provider |
| Logs & backups | platform | **your responsibility** (§5.8) |
| Cron / edge funcs | n/a | not used by this app ✓ |

Once the server is verified and DNS points to it, you can delete or pause the Vercel
project (or keep it as a staging preview).

---

## 6. After migration — next roadmap

In priority order (each starts with a threat model per §4):
1. **Admin panel** — Auth.js credentials (no public signup), reservations list, per-car
   calendar, client data, statuses (available/rented/service/damaged), **editable prices**.
2. **Contact form + transactional email** (Resend or SMTP) — the `/contact` page has no
   form yet by design (no mailer wired).
3. Contract PDF + checkbox/SMS acceptance → email/SMS confirmations.
4. Then revisit **document uploads** (private S3/MinIO + field encryption + RODO basis) and
   real content (prices, photos, legal data, hours, address).
