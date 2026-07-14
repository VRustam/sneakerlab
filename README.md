# SneakerLab

> A portfolio-grade 3D sneaker commerce experience for web and Flutter, backed by Supabase.

SneakerLab is being built as a secure demo-commerce platform: customers can discover generic sneakers, manage a cart and orders, and explore supported products in 3D. A role-protected web admin experience and a Flutter customer app share the same Supabase backend.

## Current status

Phase 1 is in progress: the monorepo, web shell, authentication interfaces, test foundation, and CI are being established. See [progress](docs/PROGRESS.md) and the truthful [test report](docs/TEST_REPORT.md).

## Stack

- Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui-style local primitives
- React Hook Form, Zod, Supabase JavaScript client, Vitest, React Testing Library, Playwright
- Flutter, Material 3, Riverpod, GoRouter, Supabase Flutter
- Supabase PostgreSQL, Auth, Storage, RLS, SQL migrations

## Repository layout

```text
apps/web/              Next.js storefront and admin application
apps/mobile/           Flutter customer application
packages/shared-types/ Cross-platform TypeScript domain contracts
supabase/              Migrations, database tests, and deterministic seeds
docs/                  Architecture, progress, test reports, and human checks
```

## Prerequisites

- Node.js 22+
- pnpm 11+
- Flutter stable for mobile development
- Supabase CLI and Docker for local database validation (Phase 2 onward)

## Environment variables

Copy `.env.example` to `apps/web/.env.local` and add only a Supabase project URL and anonymous key. `SUPABASE_SERVICE_ROLE_KEY` is server-only and is never needed by browser or Flutter customer code.

## Local development

```bash
pnpm install
pnpm dev:web
```

In another terminal, run the web checks:

```bash
pnpm verify
pnpm test:e2e
```

For mobile:

```bash
cd apps/mobile
flutter pub get
flutter analyze
flutter test
flutter run --dart-define=SUPABASE_URL=... --dart-define=SUPABASE_ANON_KEY=...
```

## Roadmap

1. Foundation, auth shell, and tests
2. Supabase schema, RLS, storage, seeds, and security tests
3. Storefront catalog, details, and favorites
4. Cart, demo checkout, and customer orders
5. Secure web admin dashboard
6. Flutter customer commerce app
7. 3D viewer, portfolio polish, and deployment readiness

## Known limitations

This initial phase intentionally does not yet contain a product database, cart, orders, admin CRUD, or 3D viewer. The Flutter SDK must initialize successfully before mobile commands can be validated locally; see the test report for the current environment result.
