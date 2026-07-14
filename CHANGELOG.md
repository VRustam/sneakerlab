# Changelog

All notable project changes are recorded here.

## Unreleased

### Phase 1 - Foundation

- Initialized the pnpm monorepo, Next.js shell, Flutter source shell, testing setup, CI, and documentation.
- Added Supabase client abstractions and an email/password authentication shell.

### Phase 2 - Secure Supabase data model

- Added ordered commerce schema migrations with constraints, indexes, timestamp/profile triggers, role protection, and order-status enforcement.
- Added RLS policies, secure server-calculated order creation RPC, storage buckets/policies, deterministic generic seed data, and generated-type-compatible contracts.
- Added pgTAP-ready and static migration/security tests plus a client/mobile service-role secret scan.
