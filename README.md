# A&A Corporation — Premium Car Rental

Booking-first website for **A&A Corporation — Premium Car Rental (Warsaw)**. A
self-service online reservation system (not a brochure): pick a car → check
availability → choose dates & pickup → enter data → upload documents → accept the
contract → receive confirmation. Two surfaces: a **public site** (PL/EN) and an
**admin panel**.

> **Current scope:** reservation-only MVP — **no online payment**. A reservation
> is submitted as a request and blocks the car's calendar only after an admin
> confirms it in the panel.

## Tech stack

| Concern    | Choice                                                |
| ---------- | ----------------------------------------------------- |
| Framework  | Next.js 16 (App Router) + TypeScript                  |
| Styling    | Tailwind CSS v4 (CSS-first tokens)                    |
| Motion     | Framer Motion (reduced-motion aware)                  |
| i18n       | next-intl — PL (default, `/`) + EN (`/en`)            |
| Database   | PostgreSQL + Drizzle ORM                              |
| Storage    | S3-compatible (local disk in dev)                    |
| Admin auth | Auth.js (credentials) — later phase                  |
| Hosting    | Vercel now; portable to Hetzner (standalone + Docker) |

**Portability is a hard requirement.** No Vercel-proprietary APIs in business
logic; DB and storage sit behind thin abstractions (`src/lib/db`, `src/lib/storage`)
so providers can be swapped for a self-managed Hetzner box later.

## Getting started

```bash
cp .env.example .env          # adjust values as needed
docker compose up -d db       # local Postgres (optional for the marketing shell)
npm install
npm run dev                   # http://localhost:3000  (PL)  ·  /en (EN)
```

The public marketing pages run without a database. Database-backed features
(booking, admin) require `DATABASE_URL`.

## Scripts

| Script                | Purpose                                 |
| --------------------- | --------------------------------------- |
| `npm run dev`         | Dev server (Turbopack)                  |
| `npm run build`       | Production build (standalone output)    |
| `npm run start`       | Serve the production build              |
| `npm run lint`        | ESLint                                  |
| `npm run typecheck`   | `tsc --noEmit`                          |
| `npm run format`      | Prettier                                |
| `npm run db:generate` | Generate Drizzle migrations from schema |
| `npm run db:migrate`  | Apply migrations                        |
| `npm run db:studio`   | Drizzle Studio                          |

## Project structure

```
src/
  app/[locale]/        Localized routes (PL/EN), root layout + home
  components/
    brand/             Logo (brand-book rules)
    layout/            Header, footer, locale switcher
    motion/            Reveal, Parallax (prefers-reduced-motion aware)
    ui/                Button, Container
  i18n/                next-intl routing / request / navigation
  lib/
    config/site.ts     Immutable brand identity + contact
    db/                Drizzle client (getDb) + schema
    storage/           Storage driver interface + local/S3 drivers
  messages/            pl.json, en.json
public/brand/          Logo variants (brand book)
```

## Design system

Brand book §10/§11: black `#000000` canvas, signal red `#ED1C24` (CTAs/accents
only), silver `#C0C0C0`, white. Raleway Bold headlines, Montserrat body. Sharp
geometry (0 radius), hairline dividers, no shadows, full-bleed photography.
Tokens live in `src/app/globals.css` (`@theme`).

## Domain rules (non-negotiable)

- **No double bookings** — enforced at the DB level (Postgres `EXCLUDE` over a
  daterange + car, added with the reservation schema), never only in the UI.
- Prices/fees are **admin-editable**, never hardcoded. Money stored as integer
  **grosze** (1/100 PLN).
- Fleet units of the same model are separate physical cars (plate/VIN/mileage)
  sharing one public listing.

## Compliance

We handle IDs, driver's licenses, PESEL/passport numbers. Uploads go to **private**
storage, exposed only via short-lived **signed URLs** behind admin auth. Minimal
retention. Analytics load only behind a RODO/GDPR consent banner.

## Roadmap

1. ✅ Scaffold, design tokens, base layout, i18n (PL/EN) — **this phase**
2. Fleet listing + car detail cards
3. Availability calendar + booking flow + live price calculator
4. Client form + document upload
5. ~~Online payment~~ (deferred — out of current scope)
6. Contract PDF + checkbox/SMS acceptance
7. Email + SMS confirmations
8. Admin panel (auth, reservations, calendars, clients, docs, statuses, prices)
