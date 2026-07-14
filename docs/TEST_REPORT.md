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

| Command or check                                     | Result                   | Notes                                                                                                                 |
| ---------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec supabase --version`                       | passed                   | Supabase CLI 2.109.1 is installed locally.                                                                            |
| `docker info --format '{{.ServerVersion}}'`          | blocked by local service | Docker binary exists, but the daemon socket at `/Users/apple/.docker/run/docker.sock` is unavailable.                 |
| `pnpm exec supabase start`                           | blocked by local service | Supabase CLI could not inspect/start services because Docker Desktop is not running.                                  |
| `pnpm exec supabase db reset`                        | blocked by local service | Could not apply migrations or seed against a clean local database without the Docker daemon.                          |
| `supabase/tests/001_schema_security.sql`             | not run                  | pgTAP test file is ready for `supabase test db` once the local stack starts. It is not a passing result.              |
| `pnpm lint`                                          | passed                   | ESLint completed successfully.                                                                                        |
| `pnpm typecheck`                                     | passed                   | Shared types and web TypeScript checks completed successfully.                                                        |
| `pnpm test`                                          | passed                   | Vitest: 9 files and 18 tests passed, including four migration/security contract tests.                                |
| `pnpm secret:scan`                                   | passed                   | No service-role key or obvious secret pattern was found in web/mobile source.                                         |
| `pnpm build`                                         | passed                   | Next.js 16.2.10 production build completed successfully.                                                              |
| `pnpm test:e2e`                                      | blocked by local sandbox | The production server started; Chromium exited before test execution because macOS denied its Mach-port registration. |
| `flutter pub get`, `flutter analyze`, `flutter test` | blocked by local SDK     | Repeated Phase 1 limitation: the installed Flutter Dart VM crashes during startup.                                    |

### Database validation to run once Docker is available

```bash
pnpm exec supabase start
pnpm exec supabase db reset
pnpm exec supabase test db
```

The reset must apply all three migrations, load the four categories and ten products in `supabase/seed.sql`, and then execute the pgTAP checks. The static migration tests are useful local coverage, but they do not replace this database execution.

## Continuation blocker

Phase 3 is intentionally blocked until Docker Desktop is running and the local Supabase stack can pass the Phase 2 reset/test flow. The Flutter SDK failure remains a separate blocker for Phase 6 validation. No catalog, favorites, cart, order, admin, or mobile integration test has been represented as passing without those required services.
