# Build brief — Admin panel + public additions

**You are a Claude Code session implementing this in the A&A Corporation car-rental
repo.** This is the most security-sensitive work in the project (admin auth, editing
prices, deleting cars, handling reservations). Treat it accordingly.

## Before you write any code

1. **Read** `README.md`, `SECURITY.md`, `HANDOFF.md`, `DEPLOY.md`.
2. **Explore and match the existing conventions** — do not reinvent:
   - Schema: `src/lib/db/schema.ts` (`carModels`, `cars`, `reservations`, `fees`,
     `pickupLocations`, enums). DB access via `getDb()` in `src/lib/db`.
   - Booking: `src/lib/booking/` — `pricing.ts` (`computeQuote`, the **only** price of
     record), `actions.ts` (server action, unit allocation, tx), `schema.ts` (Zod),
     `fees.ts` (`BOOKING_RULES`, defaults). Fleet: `src/lib/fleet/`.
   - Design system: `src/app/globals.css` (`@theme` tokens), `src/components/ui`
     (`Button`, `Container`), motion in `src/components/motion`.
   - i18n: `src/i18n/`, `src/messages/{pl,en}.json`, next-intl. **Polish is default at
     `/`**, English at `/en` (`localeDetection:false`). Middleware/CSP: `src/proxy.ts`
     + `next.config.ts`.
   - Money is integer **grosze**. No-double-booking is a Postgres `EXCLUDE` constraint
     (`drizzle/0001_*`) enforced at **confirm** time.
3. **Follow `SECURITY.md` rigorously.** Write a 3–5 line **threat model before each
   sub-feature** and a short **attacker walk-through after**. Show them to the human.
4. **Build in small, committed phases** (auth first). Do NOT do it all in one pass.
   Typecheck + lint before every commit. Small, clear commit messages.
5. **Ask the human the questions at the bottom before starting.**

## Portability & constraints

- Must run on **both** Vercel and the self-hosted Ubuntu/Docker box (`HANDOFF.md`). No
  Vercel-only APIs. Add every new env var to `.env.example`.
- Reuse the design tokens/components; on-brand (dark, hairline dividers, red accents),
  but the admin may be denser/more utilitarian than the public site.
- Every DB write behind `getDb()`, parameterized; **Zod at every boundary**; grosze.
- **Do NOT collect document uploads or PESEL/passport** yet (deferred — `SECURITY.md`).

---

## A) Admin authentication — build FIRST

- **Auth.js (NextAuth) credentials**, admins only, **no public registration**.
- New tables: `admins` (email, password_hash, name, role, totp_secret nullable,
  failed_attempts, locked_until, created_at) and `audit_log` (admin_id, action, entity,
  entity_id, before jsonb, after jsonb, ip, created_at).
- Passwords hashed with **argon2** (preferred) or bcrypt at a proper cost. First admin
  via a seed script `npm run admin:create` reading credentials from **env/CLI args**,
  never hardcoded.
- Sessions: **httpOnly + Secure + SameSite=Strict** cookies; no tokens in localStorage;
  reasonable expiry; rotate on privilege change.
- **Rate-limit login + lockout** after repeated failures; **log every failed and
  successful login** with IP + timestamp.
- Protect all `/admin/*` with **middleware AND** re-verify the session **inside every
  admin route handler / server action** (defense in depth — middleware alone is not
  enough).
- Structure so **TOTP 2FA** can be added later without a rewrite.
- Add `AUTH_SECRET` to `.env.example`.

## B) Booking management

- Reservations list: filter by **status / date range / car**, text search, pagination.
- Detail view: client data, dates, extras, **price snapshot from `quote`**, assigned unit.
- **Status state machine, server-enforced**: `pending → confirmed | rejected |
  cancelled`; `confirmed → completed | cancelled`. Reject any illegal transition.
- **Confirming blocks the calendar** — the `EXCLUDE` constraint fires on confirm; catch
  the conflict and show a clear "overlaps an existing confirmed booking" message instead
  of a 500.
- **Per-car calendar** of confirmed/blocking reservations + service periods.
- Every mutation: authz-checked, Zod-validated, **audit-logged**.

## C) Price & fee management

- Edit car-model prices (daily / monthly / deposit), extras `fees`, and pickup-location
  fees — all in the DB (grosze), Zod-validated (non-negative, sane caps), **audit-logged**.
  These already feed `computeQuote` and the public pages, so edits must reflect live.

## D) Fleet management (cars)

- CRUD for car **models** (brand/model/year/specs/description/images/published/sortOrder)
  **and** car **units** (plate/VIN/mileage/registration/insurance & inspection dates/
  status: `available|rented|service|damaged`).
- **Prefer soft-delete / archive** — never hard-delete a record that has reservations
  (restrict or archive; never orphan a reservation). Toggling `published` hides a model
  from the public site; unit status `service|damaged` removes it from availability.
- Car photo management: for now manage **image paths/URLs** (real uploads to private
  S3/MinIO are a later phase — keep the `src/lib/storage` interface in mind).

## E) Public additions

- **Regulamin** page (`/regulamin`, localized) **and Polityka prywatności / Privacy
  policy** — both **linked in the footer** (`src/components/layout/SiteFooter.tsx`).
  Content is legal: use clearly-marked **placeholders** and tell the human it needs their
  lawyer. Do NOT invent binding legal text.
- **Cookie consent banner (RODO)**: privacy-preserving default (**decline non-essential**),
  persists the choice, and **gates analytics** (GA4 / GTM / Meta Pixel) so they load
  **only after consent**. IDs come from `NEXT_PUBLIC_*` env (behind consent).
  - ⚠️ The current CSP is `'self'`-only, so third-party tags are **blocked by default**.
    Only add the specific analytics origins to the CSP, ideally **nonce-based**, and
    scope them so they're effectively inert until consent. Keep the strict default.

---

## Proposed additions (build if the human agrees)

- **Admin dashboard**: pending reservations, active rentals, cars in service, upcoming
  pickups/returns, a simple revenue snapshot.
- **Audit-log viewer** (who / what / before→after / when) for price, status and fleet changes.
- **Settings** table (admin-editable): opening hours, office address, company legal data
  (NIP/REGON) — wire the `/contact` page and future invoices/contracts to it.
- **CSV export** of reservations (accounting hand-off).
- **Reusable rate-limit utility** applied to public write endpoints too (booking + a
  future contact form) — the security rules require it.
- **Revisit the CSP `script-src` open item** (currently `unsafe-inline`): the admin
  handles sensitive data, so move to **nonce/hash-based** where feasible.
- Destructive-action confirm dialogs, empty states, toasts, optimistic updates.

## Questions to ask the human before starting

1. Confirm **Auth.js credentials** (vs Lucia)? Add **TOTP 2FA** now, or just structure for it?
2. Admin UI in **Polish only**, or bilingual PL/EN?
3. Do you have **GA4 / GTM / Meta Pixel IDs** yet (for the cookie-gated analytics), or stub them?
4. Keep the current limits (**min driver age 21**, **max rental 90 days**) or change?
5. Any real **regulamin / privacy** content now, or placeholders pending your lawyer?
6. **Soft-delete (archive)** cars, or allow hard delete only when a car has no reservations?
7. Should confirming a booking auto-set the unit's status to `rented` for the rental window,
   or keep unit status manual?
