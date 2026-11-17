# ChooseU Security Hardening - Order Lookup Flow (Branch: login-security)

## Session Metadata
- **Current Phase**: Phase 1 (Backend API Hardening) — Complete; Ready for Phase 2
- **Active Branch**: `login-security`
- **Database Status Clarification**: The SQL policies in the database have NOT been dropped yet. Existing database policies remain unchanged until migration `20261118011200_lock_consultation_orders.sql` is manually applied by the operator. The application code has been refactored so that once applied, all lookups and mutations route through the server-side service-role client without relying on anon permissions.
- **Touched Files**:
  - `supabase/migrations/20261118011200_lock_consultation_orders.sql` (Drops anon_select_own_order and revokes select from anon; unexecuted)
  - `src/lib/supabase.ts` (Configured server-only Supabase client with `SUPABASE_SERVICE_ROLE_KEY`)
  - `src/app/api/orders/route.ts` (Phase 1 hardened: 80-bit Crockford Base32 CSPRNG, strict 5 req/min dual-key rate limit, uniform 404, timing normalization, minimal payload)
  - `src/lib/security-db.ts` (Completely purged direct client-side Supabase REST calls; routed lookups to `/api/orders`)
  - `src/components/PlatformPages.tsx` (Refactored `TrackOrderView` to fetch `/api/orders` directly)
  - `src/app/track-order/page.tsx` (Clean props passing to `TrackOrderView`)
  - `src/components/entry/RedesignedLoginForm.tsx` (Safeguarded against stripped fields)
  - `scripts/verify-phase05.mjs` (Automated verification script for Phase 0.5 with live probe)
  - `next.config.ts` (Configured `cpus: 1, workerThreads: false` for clean build concurrency)
- **Next Step**: Phase 2 (Client Data Service Hardening in `src/lib/security-db.ts`).
- **Open Blockers**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is present in `chooseu/.env.local` for server-side queries.

---

## Master Task Checklist

### Phase 0: Security Reconnaissance & Baseline Audit (Read-Only)
- [x] Task 0.1: Create branch `login-security` and initialize `PROGRESS.md`.
- [x] Task 0.2: Audit exact fields returned by all order lookup paths and caller privileges (anon vs auth).
- [x] Task 0.3: Audit `order_code` generation, entropy, randomness sources, and legacy guess space.
- [x] Task 0.4: Conduct read-only RLS inspection on Supabase `consultation_orders` table via anon key.
- [x] Task 0.5: Audit all internal call sites for order lookups (Login form, TrackOrderView, DataService).
- [x] Task 0.6: Deliver Phase 0 Security Report, submit proposed Fix Plan, and await user "approved".

### Phase 0.5: Emergency Direct Supabase Elimination (COMPLETED)
- [x] Task 0.5.1: Create migration `20261118011200_lock_consultation_orders.sql` (drops anon SELECT, unexecuted).
- [x] Task 0.5.2: Rewrite `src/app/api/orders/route.ts` with server-only client using `SUPABASE_SERVICE_ROLE_KEY`.
- [x] Task 0.5.3: Strip returned fields to strictly `{ order_code, order_status, progress_label }`.
- [x] Task 0.5.4: Remove all direct client-side calls to `consultation_orders` across `TrackOrderView` and `DataService`.
- [x] Task 0.5.5: Verified green production build (`npm run build`).

### Phase 1: Backend API Hardening (`src/app/api/orders/route.ts`) (COMPLETED)
- [x] Task 1.1: Remove phone lookup entirely; reject non-code queries with uniform response.
- [x] Task 1.2: Restrict returned public fields strictly to `order_code`, `order_status`, `progress_label`.
- [x] Task 1.3: Enforce strict rate limiting (5 req/min per IP + per identifier, fail-closed).
- [x] Task 1.4: Implement uniform response body, status, and normalized timing for misses/invalid inputs.
- [x] Task 1.5: Implement 80-bit Crockford Base32 CSPRNG generator for new `order_code`s.
- [x] Task 1.6: Run `tsc --noEmit` and commit Phase 1.

### Phase 2: Client Data Service Hardening (`src/lib/security-db.ts`)
- [x] Task 2.1: Remove direct anon Supabase REST queries from `DataService.getOrderByCodeOrPhone`.
- [x] Task 2.2: Enforce code-only query delegation through hardened `/api/orders` route.
- [x] Task 2.3: Restrict local storage fallback to strict `order_code` matching.
- [ ] Task 2.4: Run `tsc --noEmit` and commit Phase 2.

### Phase 3: Copy Registry & Minor Consent Notice (`src/lib/copy-registry.ts`)
- [ ] Task 3.1: Update entry copy to remove phone references and reflect code-only quick access.
- [ ] Task 3.2: Add minor privacy/consent notice marked for legal review.
- [x] Task 3.3: Verify compliance with banned terms dictionary (`check:terms`).
- [ ] Task 3.4: Run `tsc --noEmit` and commit Phase 3.

### Phase 4: Login Form Redesign (`src/components/entry/RedesignedLoginForm.tsx`)
- [ ] Task 4.1: Update Quick Access tab to accept Order Code only with KeyRound icon.
- [ ] Task 4.2: Strip phone number fallback authentication and regex matching.
- [ ] Task 4.3: Integrate calm state feedback for 429 and uniform lookup responses.
- [ ] Task 4.4: Run `tsc --noEmit` and commit Phase 4.

### Phase 5: Verification, Automated Testing & Handover
- [x] Task 5.1: Create automated test script `scripts/verify-phase05.mjs`.
- [ ] Task 5.2: Execute test suite against live server (phone rejection, field stripping, 429 limit, timing).
- [x] Task 5.3: Run `npm run check:terms`, `npx tsc --noEmit`.
- [ ] Task 5.4: Provide final status report and `git diff --stat`.
