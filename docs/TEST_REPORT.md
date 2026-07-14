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
