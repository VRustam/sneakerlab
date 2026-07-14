# SneakerLab Test Report

Last updated: 2026-07-14

## Phase 1

| Command or check    | Result                   | Notes                                                                                                                                                                                                             |
| ------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install`      | passed                   | Completed with pnpm 11.7.0 after explicitly allowing the required `sharp` and `unrs-resolver` dependency build scripts.                                                                                           |
| `pnpm lint`         | passed                   | ESLint completed successfully.                                                                                                                                                                                    |
| `pnpm typecheck`    | passed                   | Shared types and web TypeScript checks completed successfully.                                                                                                                                                    |
| `pnpm test`         | passed                   | Vitest: 8 files and 14 tests passed.                                                                                                                                                                              |
| `pnpm build`        | passed                   | Next.js 16.2.10 production build completed successfully.                                                                                                                                                          |
| `pnpm verify`       | passed                   | Re-ran lint, typecheck, unit/component tests, and production build after all fixes.                                                                                                                               |
| `pnpm format:check` | passed                   | Prettier completed successfully.                                                                                                                                                                                  |
| `pnpm peers check`  | passed                   | No peer dependency issues found.                                                                                                                                                                                  |
| `pnpm test:e2e`     | blocked by local sandbox | The production server started, but Chromium exited before test execution with `bootstrap_check_in ... MachPortRendezvousServer ... Permission denied (1100)`. The three Playwright tests are not passing results. |
| `flutter pub get`   | blocked by local SDK     | Command was run and exited during Dart VM startup with `runtime/vm/cpuinfo_macos.cc: 42: error: unreachable code`.                                                                                                |
| `flutter analyze`   | blocked by local SDK     | Command was run and exited during the same Dart VM startup failure.                                                                                                                                               |
| `flutter test`      | blocked by local SDK     | Command was run and exited during the same Dart VM startup failure.                                                                                                                                               |

## Environment checks performed

- `node --version`: passed (`v26.0.0`)
- `pnpm --version`: passed (`11.7.0`)
- `pnpm view next@latest version`: passed (`16.2.10`)
- `pnpm view react@latest version`: passed (`19.2.7`)
- `supabase --version`: not run successfully because the command is not installed.
- `flutter --version`: failed before completion with `runtime/vm/cpuinfo_macos.cc: 42: error: unreachable code`.
- `PLAYWRIGHT_BROWSERS_PATH=<repo>/.playwright-browsers pnpm --filter @sneakerlab/web exec playwright install chromium --only-shell`: passed; the required Chromium headless shell was downloaded.
- `agent-browser open http://127.0.0.1:3100`: not run because the `agent-browser` executable is unavailable in this environment.

## Manual security review

- Secret-pattern scan was run with `rg`. Matches were limited to the documented placeholder `SUPABASE_SERVICE_ROLE_KEY` and server-only safety guidance; no key value or JWT-like credential was found.
- Scan for `.only` and `.skip` in `apps/web` found no focused or skipped test suites.
- Scan for `TODO` and `FIXME` in application source and docs found no critical-flow placeholders.

No test or build result is treated as passed until the listed command completes successfully.

## Phase 2

| Command or check                                     | Result                   | Notes                                                                                                                    |
| ---------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `pnpm exec supabase --version`                       | passed                   | Supabase CLI 2.109.1 is installed locally.                                                                               |
| `docker info --format '{{.ServerVersion}}'`          | blocked by local sandbox | Docker Desktop was opened, but this Codex process is denied access to `/Users/apple/.docker/run/docker.sock`.            |
| `pnpm exec supabase start`                           | passed (user terminal)   | User-run Terminal output confirms the local stack started after applying all three migrations and seed data.             |
| `pnpm exec supabase db reset`                        | passed (user terminal)   | User-run Terminal output confirms a clean reset applied all migrations and `supabase/seed.sql`.                          |
| `supabase/tests/001_schema_security.sql`             | passed (user terminal)   | `pnpm exec supabase test db` completed successfully: 1 file and 22 pgTAP tests passed.                                   |
| `pnpm lint`                                          | passed                   | ESLint completed successfully.                                                                                           |
| `pnpm typecheck`                                     | passed                   | Shared types and web TypeScript checks completed successfully.                                                           |
| `pnpm test`                                          | passed                   | Vitest: 9 files and 18 tests passed, including four migration/security contract tests.                                   |
| `pnpm secret:scan`                                   | passed                   | No service-role key or obvious secret pattern was found in web/mobile source.                                            |
| `pnpm build`                                         | passed                   | Next.js 16.2.10 Webpack production build completed successfully after Turbopack was blocked from binding a sandbox port. |
| `pnpm test:e2e`                                      | blocked by local sandbox | The production server started; Chromium exited before test execution because macOS denied its Mach-port registration.    |
| `flutter pub get`, `flutter analyze`, `flutter test` | blocked by local SDK     | Repeated Phase 1 limitation: the installed Flutter Dart VM crashes during startup.                                       |

### Latest revalidation

- `pnpm lint`, `pnpm typecheck`, and `pnpm test` completed successfully; Vitest ran 9 files and 18 tests.
- `pnpm build` completed successfully with `next build --webpack`. The default Turbopack build had failed only because this sandbox denied its local process/port operation, so the project script now uses the supported Webpack compiler.
- `pnpm secret:scan` completed successfully.
- The Codex sandbox still cannot access Docker directly. The user ran the local stack from Terminal: `supabase start` and `supabase db reset` applied the three migrations and seed data, then `supabase test db` passed all 22 pgTAP assertions. This is a user-run result, not a command executed by the Codex sandbox.

## Continuation status

Phase 2's local database gate is complete. Phase 3 can now proceed. The Codex sandbox still cannot directly connect to Docker, so any later database-only validation must be run in the user's Terminal and reported verbatim. The Flutter SDK failure remains a separate Phase 6 validation blocker.

## Phase 3

| Command or check    | Result                   | Notes                                                                                                                                                                                                                                      |
| ------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm lint`         | passed                   | ESLint completed successfully after the catalog server-page error-boundary refactor.                                                                                                                                                       |
| `pnpm typecheck`    | passed                   | Shared types and web TypeScript checks completed successfully.                                                                                                                                                                             |
| `pnpm test`         | passed                   | Vitest: 16 files and 34 tests passed, including filter parsing, query-plan, variant-combination, favorite-path, and catalog-card coverage.                                                                                                 |
| `pnpm build`        | passed                   | Next.js 16.2.10 Webpack production build completed successfully with the configured local public Supabase variables.                                                                                                                       |
| `pnpm format:check` | passed                   | Prettier completed successfully after all Phase 3 source changes.                                                                                                                                                                          |
| `pnpm secret:scan`  | passed                   | No service-role key or obvious secret pattern was found in web/mobile source.                                                                                                                                                              |
| `git diff --check`  | passed                   | No whitespace errors were reported.                                                                                                                                                                                                        |
| `pnpm test:e2e`     | blocked by local sandbox | Playwright did not execute any test: the sandbox denied `next start` binding `0.0.0.0:3100` with `listen EPERM`. This is not a passing E2E result. Run the same command in a normal local Terminal to exercise the five catalog scenarios. |

### Phase 3 verification scope

- Server-rendered catalog reads are centralized in a typed repository and always scope public product queries to active products.
- URL-backed search, category/size/color/price/featured filters, sort order, pagination, clear filters, empty/error/loading states, product cards, product detail, variant availability, anonymous favorite continuation, and user-owned favorite mutations have implementation and unit/component coverage.
- The Playwright suite covers seeded catalog search, category filter/clear URLs, price sorting, product detail plus an unavailable size, anonymous favorite sign-in continuation, and mobile horizontal overflow. It remains unexecuted because this Codex sandbox blocks the web-server port before the browser launches.
