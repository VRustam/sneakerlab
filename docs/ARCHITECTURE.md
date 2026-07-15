# SneakerLab Architecture

## System overview

SneakerLab is a pnpm workspace with a Next.js web application, Flutter customer app, shared TypeScript contracts, and a Supabase backend. The web application keeps privileged authorization decisions on the server. Browser and mobile applications use only the Supabase public URL, anonymous key, and their authenticated session.

```mermaid
flowchart LR
  Customer["Customer browser"] --> Storefront["Next.js storefront"]
  Admin["Admin browser"] --> Dashboard["Next.js admin dashboard"]
  CustomerMobile["Flutter customer app"] --> PublicApi["Supabase public API\nanon key + session"]
  Storefront --> Server["Server components / actions"]
  Dashboard --> Server
  Storefront --> Web3D["Lazy client 3D viewer\nThree.js + R3F + Drei"]
  CustomerMobile --> Mobile3D["Touch 3D viewer\nmodel-viewer"]
  Server --> Supabase["Supabase Auth · PostgreSQL · Storage"]
  PublicApi --> Supabase
  Server --> RLS["RLS, RPCs, triggers\nand constraints"]
  RLS --> Supabase
```

## Authentication and authorization

```mermaid
sequenceDiagram
  participant U as User
  participant C as Web or Flutter client
  participant A as Supabase Auth
  participant S as Next.js server
  participant D as PostgreSQL + RLS
  U->>C: Sign in with email and password
  C->>A: Create session using public credentials
  A-->>C: Session token
  C->>S: Protected web request with session cookie
  S->>A: Resolve current user
  S->>D: Read profile role and requested data
  D-->>S: RLS-scoped response
  S-->>C: Authorized page or safe redirect
```

- Customer code never reads a service-role key or supplies a trusted user ID for owner-scoped data.
- Every web admin route checks the session and profile role in the server layout and again in each server action.
- PostgreSQL RLS is the final authority: a customer cannot bypass UI checks to write catalog data, another profile, favorites, cart items, or orders.
- `create_order_from_cart` resolves `auth.uid()`, derives price and stock from database rows, locks the relevant rows, writes snapshots, and clears the cart atomically.

## Customer commerce flow

```mermaid
flowchart LR
  Browse["Catalog and filters"] --> Detail["Product detail"]
  Detail --> Variant["Select available variant"]
  Detail --> Model["Optional 3D preview"]
  Variant --> Cart["Guest local cart or RLS cart"]
  Cart --> Login{"Signed in?"}
  Login -- No --> SignIn["Internal safe sign-in return"]
  Login -- Yes --> Checkout["Demo checkout form"]
  Checkout --> Rpc["create_order_from_cart RPC"]
  Rpc --> Order["Immutable order snapshot"]
  Order --> History["Owner-scoped order history"]
```

Guest-cart prices are display-only. The checkout RPC uses the current database price and validates stock just before order creation. Variant items decrement variant stock; non-variant items decrement product stock, never both.

## Admin media and catalog flow

```mermaid
flowchart LR
  Admin["Authenticated admin"] --> Form["Validated product/category/variant form"]
  Form --> Action["Server action role check"]
  Action --> RLS["Admin RLS policy"]
  Admin --> Upload["Browser upload with admin session"]
  Upload --> Storage["Storage policy"]
  Storage --> Link["Server action links model/image URL"]
  Link --> Products["products / product_images"]
  Products --> Viewer["Public detail page uses optional model URL"]
```

Images accept JPEG, PNG, or WebP up to 5 MB. GLB/glTF model uploads accept up to 20 MB and are stored separately. The admin screen allows a model to be replaced or unlinked; it does not expose a service-role credential.

## 3D rendering behavior

```mermaid
flowchart TD
  URL["product.model_3d_url"] --> HasModel{"Model URL exists?"}
  HasModel -- No --> ImageFallback["Accessible image fallback"]
  HasModel -- Yes --> Motion{"Reduced motion?"}
  Motion -- Yes --> OptIn["Static fallback + explicit enable"]
  Motion -- No --> Lazy["Lazy-load 3D renderer"]
  OptIn --> Lazy
  Lazy --> Load{"GLB/glTF loads?"}
  Load -- Yes --> Orbit["Orbit/touch rotation + zoom + reset"]
  Load -- No --> ImageFallback
```

The web canvas is dynamically imported with SSR disabled, uses constrained orbit zoom and low-power rendering, and is isolated by an error boundary. The Flutter viewer accepts the bundled local example or HTTPS model URLs; it uses an image poster and leaves the product gallery usable if rendering is unavailable.

## Data model

```mermaid
erDiagram
  PROFILES ||--|| AUTH_USERS : extends
  CATEGORIES ||--o{ PRODUCTS : contains
  PRODUCTS ||--o{ PRODUCT_IMAGES : has
  PRODUCTS ||--o{ PRODUCT_VARIANTS : has
  AUTH_USERS ||--o{ FAVORITES : owns
  PRODUCTS ||--o{ FAVORITES : saved
  AUTH_USERS ||--o{ CART_ITEMS : owns
  PRODUCTS ||--o{ CART_ITEMS : selected
  PRODUCT_VARIANTS ||--o{ CART_ITEMS : optionally_selected
  AUTH_USERS ||--o{ ORDERS : places
  ORDERS ||--o{ ORDER_ITEMS : snapshots
  PRODUCTS ||--o{ ORDER_ITEMS : references
```

See [supabase/README.md](../supabase/README.md) for local migration, type-generation, and safe admin-assignment workflows.
