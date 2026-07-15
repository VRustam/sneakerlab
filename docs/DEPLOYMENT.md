# Deployment Guide

This guide describes a safe deployment path. It does not authorize or perform a production deployment.

## 1. Hosted Supabase

1. Create or select the intended hosted Supabase project.
2. Authenticate and link only from a trusted developer machine:

   ```bash
   pnpm exec supabase login
   pnpm exec supabase link --project-ref <project-ref>
   pnpm exec supabase db push
   ```

3. Review every migration before `db push`. Do **not** run `supabase db reset` against a hosted project; it is destructive.
4. Decide whether the generic demo seed is appropriate. If it is, seed only after review through a privileged SQL workflow. Do not carry local browser-test identities or their passwords into production.
5. Confirm the migrations created the `product-images`, `product-models`, and `avatars` buckets and their policies. Upload a JPEG and GLB/glTF as an admin, then verify a customer cannot write to those paths.
6. Create the first admin only through a privileged database session or Supabase SQL Editor after confirming the intended authenticated user UUID:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = '<confirmed-auth-user-uuid>';
   ```

Never use the browser, Flutter client, or a public API route to grant an admin role.

## 2. Web deployment on Vercel

1. Import the repository and set the Vercel project root to the repository root.
2. Install with `pnpm install --frozen-lockfile`; build with `pnpm build`.
3. Configure environment variables for Preview and Production:

   | Variable                        | Scope                 | Notes                                                                                                                 |
   | ------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------- |
   | `NEXT_PUBLIC_SUPABASE_URL`      | browser and server    | Hosted project URL; public by design.                                                                                 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser and server    | Supabase publishable/anonymous key; public by design.                                                                 |
   | `SUPABASE_SERVICE_ROLE_KEY`     | server only, optional | Only for a tightly controlled server task. Never prefix with `NEXT_PUBLIC_`; normal customer flows do not require it. |

4. Add the Vercel production and preview URLs to Supabase Auth redirect URLs. Use exact HTTPS origins.
5. Deploy a preview first, then run the smoke tests below before promoting to production.

## 3. Flutter release configuration

Configure only the public Supabase URL and anonymous key through `--dart-define`, CI secrets, or platform-specific release configuration. A service-role key must never be embedded in a Flutter binary.

`model_viewer_plus` renders a standards-based WebView `<model-viewer>` component. Before a device build:

- iOS: `ios/Runner/Info.plist` enables `io.flutter.embedded_views_preview` for the embedded model renderer.
- Android: the main manifest declares `INTERNET` for Supabase and HTTPS model delivery. Its network-security configuration permits HTTP only to `localhost` and `127.0.0.1`, which the plugin needs to serve the bundled model. It does not enable global cleartext traffic; hosted model URLs remain HTTPS-only.
- Product model URLs must be HTTPS and should use optimized, licensed GLB/glTF assets. Test a poster/image fallback on a physical Android and iOS device.

Build release artifacts only after the quality gate:

```bash
flutter build appbundle --dart-define=SUPABASE_URL=... --dart-define=SUPABASE_ANON_KEY=...
flutter build ipa --dart-define=SUPABASE_URL=... --dart-define=SUPABASE_ANON_KEY=...
```

## 4. Deployment smoke test

- [ ] Open public home, catalog, a product without a model, and Pulse Layer with the generic 3D model.
- [ ] Verify reduced-motion behavior and the image fallback after deliberately using an unavailable model in a non-production test record.
- [ ] Register/sign in/sign out; confirm customer routes redirect while anonymous.
- [ ] Complete a demo checkout with a test customer and confirm exactly one owner-scoped order appears.
- [ ] Confirm a customer receives no admin UI or catalog mutation access; confirm an intended admin can upload/relink a model and update an allowed order status.
- [ ] Inspect deployed browser and Flutter artifacts for no service-role key, local test password, or unexpected source map exposure.
- [ ] Check Supabase Auth redirect URLs, Storage policies, RLS policies, logs, and error monitoring.

## Operational limits

- Checkout is a demo workflow with no payment capture.
- A production model pipeline should optimize geometry/textures, serve assets from a CDN, set a model size budget, and monitor download/render failures.
- Apply schema changes as reviewed, forward-only migrations. Back up production data and use a staging project before a non-trivial migration.
