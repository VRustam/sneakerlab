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
