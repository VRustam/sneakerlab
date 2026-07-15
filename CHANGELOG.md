# Changelog

All notable project changes are recorded here.

## Unreleased

### Phase 7 - 3D experience and release readiness

- Added a lazy, client-only React Three Fiber/Drei glTF viewer with constrained orbit controls, loading/error/image fallbacks, reduced-motion opt-in, and reset behavior.
- Added the generic Pulse Layer glTF demo model, a secure seed link, web viewer coverage, and four browser journeys for the 16-flow final suite.
- Added Flutter touch 3D viewer integration with bundled-asset/HTTPS source rules, poster fallback, and focused mobile tests.
- Added generated Android/iOS runners, iOS embedded-view support, and Android network rules that permit only localhost cleartext traffic required by the bundled model proxy.
- Added an authenticated order-transition migration and database regression coverage so the admin-only status workflow succeeds under real RLS.
- Rewrote portfolio documentation; added architecture diagrams, deployment guidance, capture checklist, and Phase 7 manual checks.

### Phases 3–6 - Commerce applications

- Added the responsive catalog, RLS-owned favorites, cart/checkout/order flows, customer profile/avatar support, and role-protected admin commerce management.
- Added the Flutter customer application for authentication, catalog, favorites, cart, demo checkout, order history, and account management.

### Phase 1 - Foundation

- Initialized the pnpm monorepo, Next.js shell, Flutter source shell, testing setup, CI, and documentation.
- Added Supabase client abstractions and an email/password authentication shell.

### Phase 2 - Secure Supabase data model

- Added ordered commerce schema migrations with constraints, indexes, timestamp/profile triggers, role protection, and order-status enforcement.
- Added RLS policies, secure server-calculated order creation RPC, storage buckets/policies, deterministic generic seed data, and generated-type-compatible contracts.
- Added pgTAP-ready and static migration/security tests plus a client/mobile service-role secret scan.
