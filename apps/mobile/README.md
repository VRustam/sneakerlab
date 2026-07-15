# SneakerLab Mobile

Flutter customer application for the SneakerLab portfolio. It shares Supabase Auth, catalog, favorites, cart, demo checkout, orders, and profile data with the web storefront.

## Run locally

```bash
flutter pub get
flutter analyze
flutter test
flutter run --dart-define=SUPABASE_URL=... --dart-define=SUPABASE_ANON_KEY=...
```

Use only the Supabase project URL and publishable/anonymous key. Never embed a service-role key in this application.

## 3D product preview

Pulse Layer uses the bundled `assets/models/pulse-layer.gltf` demo asset. The viewer supports touch rotation and pinch zoom, accepts HTTPS model URLs for hosted products, and keeps the image gallery/poster as a fallback when a model cannot render.

Android and iOS runners are included. Android release builds declare `INTERNET` for Supabase and HTTPS model delivery; iOS enables embedded Flutter views for the model viewer. See the repository [deployment guide](../../docs/DEPLOYMENT.md) for device and release checks.
