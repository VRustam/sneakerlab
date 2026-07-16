# SneakerLab Test Report

Last updated: 2026-07-15

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

## Phase 4

| Command or check                        | Result                   | Notes                                                                                                                                                                                     |
| --------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                             | passed                   | ESLint completed successfully after cart, checkout, order, and avatar work.                                                                                                               |
| `pnpm typecheck`                        | passed                   | Shared types and web TypeScript checks completed successfully.                                                                                                                            |
| `pnpm test`                             | passed                   | Vitest: 20 files and 43 tests passed, including cart identity/stock limits, guest serialization, checkout schema/idempotency input, order snapshots, and the checkout migration contract. |
| `pnpm build`                            | passed                   | The Next.js Webpack production compiler completed source compilation and its build lock cleared without an error.                                                                         |
| `HOME=/tmp pnpm exec supabase db reset` | blocked by local sandbox | The temporary home workaround bypassed telemetry-file access, but this Codex sandbox was denied the Docker socket at `/var/run/docker.sock` (`connect: operation not permitted`).         |
| `pnpm test:e2e`                         | blocked by local sandbox | Playwright could not execute a test because `next start` was denied `0.0.0.0:3100` (`listen EPERM`).                                                                                      |

### Phase 4 remaining local validation

Run the following in a normal Terminal while Docker Desktop is available. The reset applies `20260714140000_add_checkout_idempotency.sql` before the database test suite:

```bash
cd /Users/apple/Documents/Codex/SneakerLab
pnpm exec supabase db reset
pnpm exec supabase test db
pnpm test:e2e
```

The browser suite includes guest add/update/remove and anonymous checkout redirect coverage. A later Phase 5 local reset adds development-only authenticated fixtures for browser tests, but fully authenticated checkout scenarios remain unexecuted here because the sandbox prevents the test server from binding its port.

## Phase 5

| Command or check                                                              | Result                   | Notes                                                                                                                                                                                                |
| ----------------------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm lint                                                                     | passed                   | ESLint completed successfully after the admin routes, actions, and components were added.                                                                                                            |
| pnpm typecheck                                                                | passed                   | Shared types and web TypeScript checks completed successfully.                                                                                                                                       |
| pnpm test                                                                     | passed                   | Vitest: 24 files and 53 tests passed, including admin validation, slug/price/stock, variant row management, upload validation, status rules, confirmation dialog, and direct-action denial coverage. |
| pnpm build                                                                    | passed                   | The Next.js Webpack build finished without an emitted error; BUILD_ID and manifests were present and the build lock cleared.                                                                         |
| pnpm secret:scan                                                              | passed                   | No service-role key or obvious secret pattern was found in web/mobile source.                                                                                                                        |
| pnpm format:check                                                             | passed                   | Prettier completed successfully.                                                                                                                                                                     |
| git diff --check                                                              | passed                   | No whitespace errors were reported.                                                                                                                                                                  |
| HOME=/tmp pnpm exec supabase db reset && HOME=/tmp pnpm exec supabase test db | blocked by local sandbox | The CLI reached the local project but this Codex sandbox was denied /var/run/docker.sock. The pgTAP suite did not run here, so the new 31 assertions are not recorded as passed.                     |
| pnpm test:e2e                                                                 | blocked by local sandbox | Next start was denied 0.0.0.0:3100 with listen EPERM before Playwright could execute any scenario. The new authenticated admin suite is not a passing result.                                        |

### Phase 5 remaining local validation

Run these in a normal Terminal after Docker Desktop is available. Reset immediately before the browser suite because the deterministic admin flow changes seeded order status and deactivates its created product:

```bash
cd /Users/apple/Documents/Codex/SneakerLab
pnpm exec supabase db reset
pnpm exec supabase test db
pnpm test:e2e
```

The local reset creates development-only admin@sneakerlab.local and customer@sneakerlab.local fixtures for the authenticated admin browser tests. They are local test data, not deployment credentials.

## Phase 6

| Command or check             | Result                           | Notes                                                                                                                                                                                            |
| ---------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `flutter pub get`            | passed in the user's Terminal    | Dependencies resolved and `apps/mobile/pubspec.lock` is current.                                                                                                                                 |
| `flutter analyze`            | not passed on the pre-fix source | The user's analyzer output identified syntax, Riverpod 3, PostgREST query-builder, and Flutter type errors. Those source issues were corrected afterward; this is not a passing analysis result. |
| `flutter analyze` (post-fix) | passed in the user's Terminal    | Flutter reported `No issues found!` on the current mobile source.                                                                                                                                |
| `flutter test` (post-fix)    | passed in the user's Terminal    | Flutter reported all 11 tests passed.                                                                                                                                                            |
| Codex Flutter runner         | blocked by Codex sandbox         | The x86_64 Dart VM crashed in `cpuinfo_macos.cc` before it could inspect source; this does not invalidate the user-run local results above.                                                      |
| `pnpm lint`                  | passed                           | ESLint completed successfully.                                                                                                                                                                   |
| `pnpm typecheck`             | passed                           | Shared types and web TypeScript checks completed successfully.                                                                                                                                   |
| `pnpm test`                  | passed                           | Vitest: 24 files and 53 tests passed.                                                                                                                                                            |
| `pnpm build`                 | passed                           | Next.js 16.2.10 Webpack production build completed successfully.                                                                                                                                 |
| `pnpm format:check`          | passed                           | Prettier reported all matched files correctly formatted.                                                                                                                                         |
| `pnpm secret:scan`           | passed                           | No service-role key or obvious secret pattern was found in web/mobile source.                                                                                                                    |
| `pnpm test:e2e`              | blocked in Codex sandbox         | `next start` was denied `0.0.0.0:3100` with `listen EPERM` before Playwright could execute a scenario.                                                                                           |

Phase 6's mobile quality gate is complete. Browser E2E remains blocked only by the Codex sandbox's server-port restriction; it is not recorded as a passing result.

## Phase 7

| Command or check                                     | Result                        | Notes                                                                                                                                                                                                                                                     |
| ---------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CI=true pnpm install --frozen-lockfile`             | passed                        | Lockfile, including the Three.js dependencies and security override, installed without resolution changes.                                                                                                                                                |
| `pnpm lint`                                          | passed                        | ESLint completed successfully after the 3D viewer, browser-test selector, and Auth fixture fixes.                                                                                                                                                         |
| `pnpm typecheck`                                     | passed                        | Shared types and web TypeScript checks completed successfully after the final fixes.                                                                                                                                                                      |
| `pnpm test`                                          | passed                        | Vitest: 25 files and 54 tests passed after the final fixes, including the image fallback component test.                                                                                                                                                  |
| `pnpm build`                                         | passed                        | Next.js 16.2.10 Webpack production build completed successfully after the final fixes and loaded `apps/web/.env.local`.                                                                                                                                   |
| `pnpm secret:scan`                                   | passed                        | No service-role key or obvious secret pattern was found in web/mobile source.                                                                                                                                                                             |
| `pnpm format:check` and `git diff --check`           | passed                        | Prettier and whitespace checks completed successfully.                                                                                                                                                                                                    |
| Focused/skipped/critical-placeholder scan            | passed                        | No `test.only`, `test.skip`, `describe.only`, `describe.skip`, `TODO`, or `FIXME` markers occur in application source. The historical report text itself contains the words `TODO` and `FIXME`.                                                           |
| `pnpm audit --prod`                                  | passed                        | No known production dependency vulnerabilities after forcing patched `postcss` 8.5.19 through the pnpm workspace override.                                                                                                                                |
| `pnpm audit`                                         | passed                        | No known production or development dependency vulnerabilities.                                                                                                                                                                                            |
| `HOME=/tmp pnpm exec supabase db reset`              | passed                        | A clean local database reset completed after repairing the Auth fixture. The seeded `pulse-layer` row has `/models/pulse-layer.gltf`.                                                                                                                     |
| Supabase password grant for seeded admin             | passed                        | A real local `POST /auth/v1/token?grant_type=password` returned HTTP 200 and issued a session after the clean reset.                                                                                                                                      |
| `HOME=/tmp pnpm exec supabase test db`               | passed                        | pgTAP: 1 file and 31 tests passed after the final clean reset.                                                                                                                                                                                            |
| Playwright Chromium install                          | passed                        | Chromium headless shell and FFmpeg were downloaded into the repository-local Playwright cache.                                                                                                                                                            |
| `pnpm test:e2e`                                      | blocked by Codex sandbox      | The command found all 16 scenarios and started `next start`, but Chromium crashed before a scenario ran because macOS denied `MachPortRendezvousServer` registration (`Permission denied (1100)`). None of the 16 scenarios are passing results.          |
| `flutter create --platforms=android,ios .`           | passed in user's Terminal     | Generated Android and iOS runners. The project then resolved the new 3D dependency successfully.                                                                                                                                                          |
| `flutter pub get`                                    | passed in user's Terminal     | `model_viewer_plus` 1.10.0 and its WebView dependencies resolved into `pubspec.lock`.                                                                                                                                                                     |
| `dart format lib test`                               | passed in user's Terminal     | Flutter formatted 32 files, including the 3D viewer and its focused test.                                                                                                                                                                                 |
| `flutter analyze` (pre-fix)                          | not passed in user's Terminal | The newly generated default `widget_test.dart` referenced missing `MyApp`; 11 existing one-line `if` statements also triggered the enabled curly-braces lint. Both causes were corrected afterward.                                                       |
| `flutter test` (pre-fix)                             | not passed in user's Terminal | The generated default `widget_test.dart` failed to compile because `MyApp` does not exist. Remaining test runner errors were cascading compilation failures. The file was removed afterward.                                                              |
| `dart format lib test` (post-fix)                    | passed in user's Terminal     | Formatter reported 31 files and no remaining changes.                                                                                                                                                                                                     |
| `flutter analyze` (post-fix)                         | passed in user's Terminal     | Flutter reported `No issues found!` in 2.6 seconds.                                                                                                                                                                                                       |
| `flutter test` (post-fix)                            | passed in user's Terminal     | Flutter reported all 14 tests passing.                                                                                                                                                                                                                    |
| `pnpm test:e2e` (user Terminal, before final fixes)  | failed                        | The command ran 16 scenarios: 9 passed and 7 failed. Five failures were ambiguous selectors and two were the Supabase Auth fixture error. All seven concrete causes were corrected afterward; this is not a passing final E2E result.                     |
| `pnpm test:e2e` (user Terminal, after Auth repair)   | failed                        | 15 of 16 scenarios passed. The remaining admin scenario found one more ambiguous `Price` selector; it now targets the exact `Price *` spinbutton and needs one final real rerun.                                                                          |
| `pnpm test:e2e` (user Terminal, after Price fix)     | failed                        | 15 of 16 scenarios passed. The remaining admin scenario found the Next.js route announcer alongside the upload validation alert; the test now matches the exact validation message and needs one final real rerun.                                        |
| `pnpm exec supabase db reset` (user Terminal, final) | passed                        | A clean reset applied all five migrations, including `grant_authenticated_order_transition_validator`, then seeded the local database.                                                                                                                    |
| `pnpm exec supabase test db` (user Terminal, final)  | passed                        | pgTAP: 1 file and all 32 tests passed. The added authenticated-admin status-transition regression test passed.                                                                                                                                            |
| `pnpm test:e2e` (user Terminal, final)               | passed                        | All 16 Chromium scenarios passed in 14.0 seconds after the clean reset.                                                                                                                                                                                   |
| `flutter pub get`, `flutter analyze`, `flutter test` | blocked by Codex sandbox      | The x86_64 Codex Dart VM exits at `runtime/vm/cpuinfo_macos.cc: 42` before it can resolve the newly added mobile 3D package or inspect source. The Phase 6 user-run result predates this Phase 7 dependency and is not treated as a current Phase 7 pass. |

### Phase 7 acceptance status

The automated Phase 7 quality gate is complete. Android and iOS runners are tracked in the repository; device 3D interaction and fallback checks remain documented manual release checks in `MANUAL_TEST_CHECKLIST.md`. Follow [deployment guidance](DEPLOYMENT.md#flutter-release-configuration) before a release build.

## Post-acceptance visual and 3D refresh

| Command or check              | Result                   | Notes                                                                                                                                                                                                                             |
| ----------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec supabase db reset` | passed                   | Clean local reset applied all migrations and refreshed the generated product imagery plus the optimized 3D model URL.                                                                                                             |
| `pnpm exec supabase test db`  | passed                   | pgTAP: 1 file and all 32 assertions passed.                                                                                                                                                                                       |
| `pnpm test`                   | passed twice             | Each independent run completed 25 files and 54 tests. The admin variant-row test now uses a synchronous click for its synchronous state transition, removing an intermittent worker-load timeout.                                 |
| `pnpm format:check`           | passed                   | Prettier reported all matched files formatted.                                                                                                                                                                                    |
| `pnpm lint`                   | passed                   | ESLint completed successfully.                                                                                                                                                                                                    |
| `pnpm typecheck`              | passed                   | Shared types and web TypeScript checks completed successfully.                                                                                                                                                                    |
| `pnpm secret:scan`            | passed                   | No service-role key or obvious secret pattern was found in web/mobile source.                                                                                                                                                     |
| `pnpm build`                  | passed                   | Next.js 16.2.10 Webpack production build completed successfully.                                                                                                                                                                  |
| Browser visual check          | passed                   | The local production page rendered the optimized, textured GLB sneaker in the live WebGL canvas at `/products/pulse-layer#three-d-preview`.                                                                                       |
| `pnpm test:e2e`               | blocked by Codex sandbox | Playwright discovered all 16 scenarios, but macOS denied Chromium Mach-port registration (`MachPortRendezvousServer ... Permission denied (1100)`) before app assertions could run. This is not recorded as a passing E2E result. |

The refreshed 3D model is a 1.4 MB, 1024px-texture derivative of Khronos' CC BY 4.0 **Materials Variants Shoe**. Its attribution is retained in `apps/web/public/models/ATTRIBUTION.md`.
