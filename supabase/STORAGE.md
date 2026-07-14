# Storage policy contract

The Phase 2 migration provisions three buckets.

| Bucket           | Visibility  | Allowed writer            | Path convention                            | MIME types                            | Size limit |
| ---------------- | ----------- | ------------------------- | ------------------------------------------ | ------------------------------------- | ---------- |
| `product-images` | Public read | Authenticated admin       | `products/<product-id>/<safe-file-name>`   | JPEG, PNG, WebP                       | 5 MB       |
| `product-models` | Public read | Authenticated admin       | `models/<product-id>/<safe-file-name>.glb` | GLB, GLTF JSON, octet stream fallback | 20 MB      |
| `avatars`        | Private     | Owning authenticated user | `<auth-user-id>/<safe-file-name>`          | JPEG, PNG, WebP                       | 2 MB       |

The browser and mobile clients must use the anonymous key and authenticated session only. No standard upload flow uses `SUPABASE_SERVICE_ROLE_KEY`.

## Manual hosted-Supabase validation

1. Apply the migrations with a privileged database connection.
2. As an admin, upload an allowed image under `product-images/products/...` and a small `.glb` under `product-models/models/...`.
3. Confirm unsupported MIME types, oversized files, and non-admin upload attempts are denied.
4. As a customer, upload an avatar under only that customer’s UUID prefix and confirm another customer cannot list, read, replace, or delete it.
