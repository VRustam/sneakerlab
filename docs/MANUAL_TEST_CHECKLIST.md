# Manual Test Checklist

All items are **not tested** until a human performs them in the relevant environment.

## Phase 1 shell

- [ ] Web: test public navigation at desktop width in a modern browser.
- [ ] Web: test mobile navigation and keyboard focus at a narrow viewport.
- [ ] Web: configure a real Supabase URL and anonymous key, then register, log in, request a password reset, and log out.
- [ ] Web: confirm anonymous users are redirected from `/account` and `/admin`.
- [ ] Web: after Phase 2, verify that a customer cannot access `/admin` and an admin can.
- [ ] Mobile: launch the app on Android and iOS after the local Flutter SDK is operational.

## Phase 2 database and storage

- [ ] Start Docker Desktop, then run `pnpm exec supabase start`, `pnpm exec supabase db reset`, and `pnpm exec supabase test db`.
- [ ] Confirm the local seed contains four categories, ten products, active and inactive catalog fixtures, and variant stock.
- [ ] Create two customer accounts and confirm each can only read/update their own profile, favorites, cart, and orders.
- [ ] Assign one admin role through the privileged SQL workflow and confirm a customer cannot alter their own role.
- [ ] Confirm inactive products and their related assets are not public.
- [ ] Attempt a direct `orders` insert as a customer; it must be denied. Complete the future checkout RPC path and verify it uses database prices and stock.
- [ ] Confirm only an admin can upload product assets and each customer can manage only their own avatar path.

## Phase 3 storefront and favorites

- [ ] With local Supabase running, run `pnpm test:e2e` in a normal Terminal; all five catalog browser scenarios should complete.
- [ ] At desktop and narrow mobile widths, browse `/products`, search, filter by every category/size/color/price combination, sort, paginate, and use Clear. Confirm the URL is shareable and there is no horizontal overflow.
- [ ] Confirm the inactive `Archive Sample` seed never appears in the public catalog, category pages, related products, or search.
- [ ] Open a product detail page and check breadcrumbs, image alternative text, responsive gallery, comparison price, shipping/return disclosures, 3D fallback, related products, and disabled impossible variant combinations.
- [ ] While signed out, use any heart control and confirm login receives only an internal `next` path. While signed in as two different customers, add and remove favorites and confirm each list remains private.

## Phase 4 cart, checkout, and orders

- [ ] As a guest, add a selected variant from a product page, change quantity, remove it, refresh `/cart`, and confirm the local browser cart persists. Sign in and use the offered merge; unavailable lines must be skipped rather than trusted.
- [ ] As an authenticated customer, add a non-variant product and a selected variant, then confirm persistent cart lines are private to that customer, stock-capped, and remove/update controls work.
- [ ] At `/checkout`, leave required fields invalid, verify accessible messages, then submit a valid demo address. Confirm the notice clearly states no real payment is charged.
- [ ] Submit the same checkout once and refresh/retry using the same in-flight request only; confirm one order exists, cart clears, prices come from the database, and variant versus product stock decrements exactly once.
- [ ] Put an inactive, deleted, or over-stocked line in a test cart through the local database and confirm checkout fails atomically with no partial order, no partial stock decrement, and no cart clear.
- [ ] With two customer accounts, confirm each can view only their own `/orders` and `/orders/[orderNumber]`; an unknown or another customer's order number must not disclose its existence.
- [ ] Upload a valid JPEG/PNG/WebP avatar under 2 MB and confirm it displays only to the owner. Attempt an unsupported type, oversized file, or another user's storage path and confirm it is rejected.

## Phase 5 admin dashboard

- [ ] Reset the local database, then sign in as admin@sneakerlab.local with the development-only password documented in the README. Confirm the dashboard metrics and latest seeded order load.
- [ ] Sign in as customer@sneakerlab.local and navigate to /admin. Confirm the customer is redirected to /account and no admin records briefly render.
- [ ] Create a product with a category, non-negative price/default stock, and a unique slug. Add/update/remove variants, then try negative and duplicate variant input; it must be rejected with a safe form message.
- [ ] Upload JPEG, PNG, and WebP images under 5 MB. Confirm preview, reorder controls, replacement/removal, and a public product gallery update. Attempt an unsupported image or oversized image and confirm rejection before upload.
- [ ] Upload a GLB/glTF model under 20 MB, confirm the preview link, then remove the product reference. Attempt a non-model or oversized file and confirm rejection.
- [ ] Create/edit/deactivate a category and verify its linked-product count. Confirm there is no destructive category delete control while products are linked.
- [ ] Create an active product and confirm it appears on /products. Deactivate it and confirm it disappears from public catalog, product detail, search, and related results.
- [ ] Search the seeded SL-20260714-E2E00001 order, move it from pending to processing, then confirm delivered is unavailable until shipped. Try a direct invalid database update as an admin client and confirm the trigger rejects it.

## Phase 6 Flutter customer application

- [ ] Run `flutter analyze` and `flutter test` from `apps/mobile` after `flutter pub get`; record the real command output.
- [ ] Launch on an Android emulator and iOS simulator with only `SUPABASE_URL` and `SUPABASE_ANON_KEY` Dart defines. Confirm there is no service-role or secret key in the application.
- [ ] Register, sign in, restore a session after relaunch, request a password reset, and sign out. Confirm anonymous users cannot open Favorites, Cart, Checkout, Account, Orders, or an order detail URL.
- [ ] Browse Home and Shop, use search, category, and price sort controls, open a product, choose an in-stock variant, save/remove a favorite, and confirm the same favorite appears on the dedicated Favorites tab.
- [ ] Add a product to Cart, increase/decrease/remove it, restart the app, and confirm the signed-in user's cart is retained. Start a demo checkout and confirm the no-payment notice, validation messages, success navigation, and order-history/detail record.
- [ ] Update a profile name, confirm email/account display and optional avatar behavior, then sign out. Repeat with a second account and confirm favorites, cart, orders, and profile stay private.

## Phase 7 3D, release readiness, and portfolio review

- [ ] In a desktop browser, open `/products/pulse-layer`; rotate with pointer drag, zoom with scroll wheel, use Reset view, and confirm surrounding product/checkout controls remain interactive.
- [ ] In a touch browser, rotate and pinch-zoom Pulse Layer. Turn on OS reduced-motion preference, reload, and confirm a static image fallback plus an explicit “Enable interactive 3D preview” option appears.
- [ ] Open a model-less product and an intentionally unavailable model in a non-production record. Confirm the accessible image fallback appears without breaking the product gallery or details.
- [ ] As an admin, upload a valid GLB and glTF below 20 MB, confirm the linked file preview, replace it, then unlink it. Attempt a bad extension, bad MIME type, and an oversized file; all must be rejected.
- [ ] On Android and iOS, confirm the Pulse Layer asset rotates and zooms with touch, then confirm remote HTTPS model and poster/image fallback behavior on a real device. Check that no HTTP model loads in a release build.
- [ ] Run the complete commands in the final test report from a normal Terminal with Docker Desktop. Record output rather than treating a command as passed by inspection.
- [ ] Capture only real screenshots using `docs/screenshots/README.md`; check every capture for tokens, credentials, addresses, and personal data before publishing.
