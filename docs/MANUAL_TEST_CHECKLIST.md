# Manual Test Checklist

All items are **not tested** until a human performs them in the relevant environment.

## Phase 1 shell

- [ ] Web: test public navigation at desktop width in a modern browser.
- [ ] Web: test mobile navigation and keyboard focus at a narrow viewport.
- [ ] Web: configure a real Supabase URL and anonymous key, then register, log in, request a password reset, and log out.
- [ ] Web: confirm anonymous users are redirected from `/account` and `/admin`.
- [ ] Web: after Phase 2, verify that a customer cannot access `/admin` and an admin can.
- [ ] Mobile: launch the app on Android and iOS after the local Flutter SDK is operational.
