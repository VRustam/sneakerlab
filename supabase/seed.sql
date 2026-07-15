-- Development-only deterministic identities for the local Playwright suite.
-- These credentials are valid only after a local Supabase database reset.
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '90000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'admin@sneakerlab.local',
    crypt('SneakerLabE2E123!', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"SneakerLab Admin"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '90000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'customer@sneakerlab.local',
    crypt('SneakerLabE2E123!', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"SneakerLab Customer"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (id) do update
set
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = excluded.updated_at;

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    '91000000-0000-0000-0000-000000000001',
    '90000000-0000-0000-0000-000000000001',
    '{"sub":"90000000-0000-0000-0000-000000000001","email":"admin@sneakerlab.local"}'::jsonb,
    'email',
    'admin@sneakerlab.local',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '91000000-0000-0000-0000-000000000002',
    '90000000-0000-0000-0000-000000000002',
    '{"sub":"90000000-0000-0000-0000-000000000002","email":"customer@sneakerlab.local"}'::jsonb,
    'email',
    'customer@sneakerlab.local',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (provider_id, provider) do update
set
  identity_data = excluded.identity_data,
  user_id = excluded.user_id,
  updated_at = excluded.updated_at;

insert into public.profiles (id, full_name, role)
values
  ('90000000-0000-0000-0000-000000000001', 'SneakerLab Admin', 'admin'),
  ('90000000-0000-0000-0000-000000000002', 'SneakerLab Customer', 'customer')
on conflict (id) do update
set
  full_name = excluded.full_name,
  role = excluded.role;

insert into public.categories (id, name, slug, description, image_url, is_active)
values
  ('10000000-0000-0000-0000-000000000001', 'Court', 'court', 'Clean low and mid profile sneakers for everyday rotation.', 'https://placehold.co/1200x800/png?text=Court', true),
  ('10000000-0000-0000-0000-000000000002', 'Running', 'running', 'Responsive sneakers designed around daily movement.', 'https://placehold.co/1200x800/png?text=Running', true),
  ('10000000-0000-0000-0000-000000000003', 'Trail', 'trail', 'Durable silhouettes for varied terrain.', 'https://placehold.co/1200x800/png?text=Trail', true),
  ('10000000-0000-0000-0000-000000000004', 'Lifestyle', 'lifestyle', 'Comfort-first styles for the city and weekend.', 'https://placehold.co/1200x800/png?text=Lifestyle', true)
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  image_url = excluded.image_url,
  is_active = excluded.is_active;

insert into public.products (id, category_id, name, slug, short_description, description, price, compare_at_price, image_url, model_3d_url, stock, is_featured, is_active)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Atlas Court', 'atlas-court', 'A quiet court staple with a structured heel.', 'Atlas Court balances a padded collar, durable cupsole, and flexible everyday leather-free upper.', 110.00, 135.00, 'https://placehold.co/1200x1200/png?text=Atlas+Court', null, 0, true, true),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Metro Knit', 'metro-knit', 'A breathable daily runner with simple cushioning.', 'Metro Knit uses a lightweight knit upper and a stable foam platform for regular city miles.', 145.00, null, 'https://placehold.co/1200x1200/png?text=Metro+Knit', null, 25, true, true),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Vector Trail', 'vector-trail', 'A grippy trail sneaker with a precise fit.', 'Vector Trail combines a rugged outsole with supportive overlays for mixed surfaces.', 160.00, 185.00, 'https://placehold.co/1200x1200/png?text=Vector+Trail', null, 0, false, true),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Form Canvas', 'form-canvas', 'A relaxed canvas low-top with a soft lining.', 'Form Canvas is a pared-back lifestyle sneaker with flexible construction and dependable traction.', 85.00, null, 'https://placehold.co/1200x1200/png?text=Form+Canvas', null, 12, false, true),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'Shift Runner', 'shift-runner', 'A responsive runner with a stable transition.', 'Shift Runner pairs balanced cushioning with a supportive midfoot frame for everyday runs.', 130.00, null, 'https://placehold.co/1200x1200/png?text=Shift+Runner', null, 0, true, true),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 'Summit Fabric', 'summit-fabric', 'A weather-ready trail sneaker with confident grip.', 'Summit Fabric features a protective upper and deep lugs for long days beyond pavement.', 175.00, 195.00, 'https://placehold.co/1200x1200/png?text=Summit+Fabric', null, 0, false, true),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'Studio Low', 'studio-low', 'A lightweight court shoe with low-profile comfort.', 'Studio Low keeps the visual language clean with breathable panels and a soft foam sockliner.', 105.00, null, 'https://placehold.co/1200x1200/png?text=Studio+Low', null, 18, false, true),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', 'Pulse Layer', 'pulse-layer', 'A layered lifestyle sneaker with replaceable 3D preview.', 'Pulse Layer is a modular lifestyle silhouette used to demonstrate the optional GLB preview path.', 120.00, 145.00, 'https://placehold.co/1200x1200/png?text=Pulse+Layer', '/models/pulse-layer.glb', 0, true, true),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000002', 'Core Motion', 'core-motion', 'A straightforward trainer built for daily movement.', 'Core Motion delivers dependable cushioning and an easy-to-style upper.', 99.00, null, 'https://placehold.co/1200x1200/png?text=Core+Motion', null, 30, false, true),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000004', 'Archive Sample', 'archive-sample', 'An inactive fixture used to validate public catalog rules.', 'Archive Sample must never appear in public catalog results.', 80.00, null, 'https://placehold.co/1200x1200/png?text=Archive+Sample', null, 0, false, false)
on conflict (id) do update
set
  category_id = excluded.category_id,
  name = excluded.name,
  slug = excluded.slug,
  short_description = excluded.short_description,
  description = excluded.description,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  image_url = excluded.image_url,
  model_3d_url = excluded.model_3d_url,
  stock = excluded.stock,
  is_featured = excluded.is_featured,
  is_active = excluded.is_active;

insert into public.product_images (id, product_id, image_url, alt_text, sort_order)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'https://placehold.co/1200x1200/png?text=Atlas+Court', 'Atlas Court sneaker in a studio setting', 0),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'https://placehold.co/1200x1200/png?text=Metro+Knit', 'Metro Knit sneaker in a studio setting', 0),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'https://placehold.co/1200x1200/png?text=Vector+Trail', 'Vector Trail sneaker in a studio setting', 0),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'https://placehold.co/1200x1200/png?text=Form+Canvas', 'Form Canvas sneaker in a studio setting', 0),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'https://placehold.co/1200x1200/png?text=Shift+Runner', 'Shift Runner sneaker in a studio setting', 0),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006', 'https://placehold.co/1200x1200/png?text=Summit+Fabric', 'Summit Fabric sneaker in a studio setting', 0),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000007', 'https://placehold.co/1200x1200/png?text=Studio+Low', 'Studio Low sneaker in a studio setting', 0),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000008', 'https://placehold.co/1200x1200/png?text=Pulse+Layer', 'Pulse Layer sneaker in a studio setting', 0),
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000009', 'https://placehold.co/1200x1200/png?text=Core+Motion', 'Core Motion sneaker in a studio setting', 0),
  ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000010', 'https://placehold.co/1200x1200/png?text=Archive+Sample', 'Archive Sample sneaker in a studio setting', 0)
on conflict (id) do update
set image_url = excluded.image_url, alt_text = excluded.alt_text, sort_order = excluded.sort_order;

insert into public.product_variants (id, product_id, color_name, color_hex, size, stock, sku)
values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Cloud', '#E8E6E0', '8', 8, 'ATLAS-CLOUD-8'),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Cloud', '#E8E6E0', '9', 12, 'ATLAS-CLOUD-9'),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Ink', '#172033', '8', 5, 'ATLAS-INK-8'),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'Ink', '#172033', '9', 0, 'ATLAS-INK-9'),
  ('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', 'Clay', '#A56C50', '8', 6, 'VECTOR-CLAY-8'),
  ('40000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000003', 'Clay', '#A56C50', '9', 7, 'VECTOR-CLAY-9'),
  ('40000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000005', 'Navy', '#203A57', '9', 9, 'SHIFT-NAVY-9'),
  ('40000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000005', 'Navy', '#203A57', '10', 11, 'SHIFT-NAVY-10'),
  ('40000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000006', 'Moss', '#5C6F52', '9', 4, 'SUMMIT-MOSS-9'),
  ('40000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000006', 'Moss', '#5C6F52', '10', 6, 'SUMMIT-MOSS-10'),
  ('40000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000008', 'Carbon', '#252525', '8', 10, 'PULSE-CARBON-8'),
  ('40000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000008', 'Carbon', '#252525', '9', 8, 'PULSE-CARBON-9')
on conflict (id) do update
set
  color_name = excluded.color_name,
  color_hex = excluded.color_hex,
  size = excluded.size,
  stock = excluded.stock,
  sku = excluded.sku;

insert into public.orders (
  id,
  user_id,
  order_number,
  subtotal,
  shipping_cost,
  total,
  status,
  customer_name,
  customer_email,
  shipping_address
)
values (
  '50000000-0000-0000-0000-000000000001',
  '90000000-0000-0000-0000-000000000002',
  'SL-20260714-E2E00001',
  99.00,
  0,
  99.00,
  'pending',
  'SneakerLab Customer',
  'customer@sneakerlab.local',
  '{"addressLine1":"1 Test Court","addressLine2":"","city":"Oakland","region":"CA","postalCode":"94601","country":"US"}'::jsonb
)
on conflict (id) do nothing;

insert into public.order_items (
  id,
  order_id,
  product_id,
  product_name,
  product_image_url,
  selected_size,
  selected_color,
  quantity,
  unit_price,
  total_price
)
values (
  '51000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000009',
  'Core Motion',
  'https://placehold.co/1200x1200/png?text=Core+Motion',
  null,
  null,
  1,
  99.00,
  99.00
)
on conflict (id) do nothing;
