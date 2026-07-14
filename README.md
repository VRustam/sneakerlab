# SneakerLab

> A portfolio-grade 3D sneaker commerce experience for web and Flutter, backed by Supabase.

SneakerLab is being built as a secure demo-commerce platform: customers can discover generic sneakers, manage a cart and orders, and explore supported products in 3D. A role-protected web admin experience and a Flutter customer app share the same Supabase backend.

## Current status

Phases 1–4 are complete: the monorepo, authentication shell, secure Supabase migrations, deterministic seed data, RLS policies, server-rendered catalog, user-owned favorites, guest and persistent carts, secure demo checkout, customer orders, profile editing, tests, and CI are in place. See [progress](docs/PROGRESS.md) and the truthful [test report](docs/TEST_REPORT.md).

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

For local Supabase validation, start Docker Desktop first, then run:

```bash
pnpm exec supabase start
pnpm exec supabase db reset
pnpm exec supabase test db
```

See [Supabase setup](supabase/README.md) for type generation, safe admin assignment, and the storage-policy contract.

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

Admin CRUD, Flutter customer features, and the interactive 3D viewer are later phases. The Codex sandbox cannot bind the Playwright test server port, while its Docker and Flutter access are separately restricted; the exact commands and results are recorded in the test report.
