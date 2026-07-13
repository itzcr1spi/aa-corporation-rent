# Security posture

Standing rules for this project live in the team brief; this file tracks how they
are implemented and any open items. Reviewed at the end of every phase.

## Implemented (Phase 1)

- **Security headers** on every response (`next.config.ts`): `Content-Security-Policy`,
  `Strict-Transport-Security` (2y, preload), `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy` (camera/mic/geo/topics denied). `X-Powered-By` removed.
- **CSP**: all directives locked to `'self'` with `object-src 'none'`, `base-uri 'self'`,
  `form-action 'self'`, `frame-ancestors 'none'`, `upgrade-insecure-requests`.
  Dev relaxes only for Turbopack HMR (`unsafe-eval`, `ws:`).
- **Secrets**: `.env*` gitignored (only `.env.example` committed, placeholders only).
  No secrets or `NEXT_PUBLIC_*` sensitive values in `src/` or the client bundle.
- **DB/storage** behind thin layers; money as integer grosze; sensitive-doc storage
  designed for private buckets + signed URLs (interface in `src/lib/storage`).

## Implemented (Phase 2 — fleet)

- **IDOR / injection**: `/fleet/[slug]` slug is regex-validated before any query and
  looked up via a parameterized ORM query; only `published` models returned; unknown
  slug → `notFound()`. Verified fail-closed against SQLi/XSS/traversal probes.

## Implemented (Phase 3 — booking)

- **No price from the client**: the booking request schema has no price fields; the
  authoritative total is recomputed server-side (`computeQuote`) from DB prices and
  snapshotted onto the reservation. Verified: injected `totalGrosze`/`price` are stripped.
- **No double-booking in the DB**: Postgres `EXCLUDE USING gist (car_id, daterange)`
  over blocking statuses (`drizzle/0001_*`). Races cannot double-book. Verified with
  PGlite: overlapping/endpoint-touching confirmed bookings rejected; pending overlaps
  and different cars allowed.
- **Boundary validation**: every booking field is Zod-validated server-side (date order,
  past dates, min/max rental, lead time, enum membership, email/phone). Unknown model/
  location → fail closed. Verified with a validation test suite.
- **Price engine** unit-tested (extras, per-day/per-rental, deposit variants, day flooring).

## Implemented (Phase 4 — client form)

- Client details (name, email, phone, date of birth, address, driver's licence no.)
  captured with the reservation. All Zod-validated server-side: PL postcode format,
  licence charset (rejects injection), **min-age 21** at rental start, DOB not in
  future. Verified with a validation test suite.
- **Document uploads and the most sensitive IDs (PESEL/passport) are deliberately
  NOT collected/stored yet** — deferred by decision until private object storage,
  field-level encryption at rest, and a RODO lawful basis + retention policy are in
  place. Flagged to the client as a legal prerequisite before going live with real
  customer data.

## Open items (tracked)

- **CSP `script-src 'unsafe-inline'`** — TODO(security). The target is nonce/hash-based
  `script-src` with no `unsafe-inline`. Next 16.2's automatic nonce propagation did not
  stamp `nonce=` on framework scripts in this stack (verified: the CSP request header
  reaches the renderer, but no nonce is emitted), and hashing RSC-payload inline scripts
  is not viable. Must be resolved **before** authenticated/admin routes render user data.
  Re-evaluate on Next upgrades. Until then, React output escaping is the primary XSS
  defense and public pages render no user-supplied HTML.
- **`npm audit`** — 6 moderate, all transitive + build-time only: `esbuild` via
  `drizzle-kit` (dev CLI, not shipped) and `postcss` bundled inside `next@16` (advisory
  needs attacker-controlled CSS through postcss stringify — not our usage). `audit fix
  --force` would downgrade Next to 9.x; rejected. Re-check on upstream patches.

## Per-phase checklist

- [ ] Threat model (3–5 lines) written before building the feature.
- [ ] Every endpoint: Zod-validate input at the boundary; authz (ownership) check, not
      just authn; recompute prices/state server-side; non-guessable IDs.
- [ ] `npm audit`; check what ships to the client bundle; no secrets added.
- [ ] Attacker walk-through of new endpoints (tamper IDs, skip steps, replay).
