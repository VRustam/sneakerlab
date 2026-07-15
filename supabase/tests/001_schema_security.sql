begin;

select plan(32);

select ok(exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'profiles'), 'profiles table exists');
select ok(exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'products'), 'products table exists');
select ok(exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'cart_items'), 'cart_items table exists');
select ok(exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'orders'), 'orders table exists');
select ok(exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'order_items'), 'order_items table exists');
select ok((select relrowsecurity from pg_class where oid = 'public.profiles'::regclass), 'profiles has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.products'::regclass), 'products has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.orders'::regclass), 'orders has RLS enabled');
select ok(exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'cart_items_unique_logical_line'), 'cart unique logical line index exists');
select has_column('public', 'orders', 'idempotency_key', 'orders store a checkout idempotency key');
select ok(exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'orders_user_idempotency_key_idx'), 'orders prevent duplicate checkout keys per user');
select ok(exists (select 1 from pg_proc where pronamespace = 'public'::regnamespace and proname = 'create_order_from_cart'), 'secure order RPC exists');
select ok(not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and cmd = 'INSERT' and roles @> array['authenticated']::name[]), 'customers have no direct order insert policy');
select ok(exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'products_read_active'), 'active product policy exists');
select ok(exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'cart_items' and policyname = 'cart_items_manage_own'), 'cart ownership policy exists');
select throws_ok($$insert into public.products (name, slug, price, stock) values ('Bad Price', 'bad-price', -1, 0)$$, '23514', null, 'negative product price is rejected');
select throws_ok($$insert into public.products (name, slug, price, stock) values ('Bad Stock', 'bad-stock', 1, -1)$$, '23514', null, 'negative product stock is rejected');
select throws_ok($$insert into public.product_variants (product_id, color_name, size, stock, sku) values ('20000000-0000-0000-0000-000000000001', 'Test', '8', -1, 'NEGATIVE-STOCK')$$, '23514', null, 'negative variant stock is rejected');
select throws_ok($$insert into public.categories (name, slug) values ('Duplicate Court', 'court')$$, '23505', null, 'duplicate category slug is rejected');
select throws_ok($$insert into public.product_variants (product_id, color_name, size, stock, sku) values ('20000000-0000-0000-0000-000000000001', 'Probe', '99', 1, 'ATLAS-CLOUD-8')$$, '23505', null, 'duplicate SKU is rejected');
select ok(exists (select 1 from pg_trigger where tgrelid = 'auth.users'::regclass and tgname = 'auth_user_creates_profile'), 'auth profile trigger exists');
select ok(exists (select 1 from pg_trigger where tgrelid = 'public.cart_items'::regclass and tgname = 'cart_items_validate_variant'), 'cart variant integrity trigger exists');
select is((select count(*) from public.categories), 4::bigint, 'seed creates four categories');
select is((select count(*) from public.products), 10::bigint, 'seed creates ten products');
select ok(exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'products_admin_manage'), 'admin product policy exists');
select ok(exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'categories' and policyname = 'categories_admin_manage'), 'admin category policy exists');
select ok(exists (select 1 from storage.buckets where id = 'product-images' and public and file_size_limit = 5242880), 'public product image bucket has the image size limit');
select ok(exists (select 1 from storage.buckets where id = 'product-models' and public and file_size_limit = 20971520), 'public model bucket has the model size limit');
select is(public.is_valid_order_status_transition('pending', 'processing'), true, 'pending orders may move to processing');
select is(public.is_valid_order_status_transition('pending', 'delivered'), false, 'pending orders cannot skip to delivered');
select ok(exists (select 1 from pg_trigger where tgrelid = 'public.orders'::regclass and tgname = 'orders_enforce_status_transition'), 'database trigger enforces order transition rules');
select lives_ok(
  $$
    set local role authenticated;
    select set_config('request.jwt.claim.sub', '90000000-0000-0000-0000-000000000001', true);
    update public.orders
    set status = 'processing'
    where id = '50000000-0000-0000-0000-000000000001';
  $$,
  'an authenticated admin can apply an allowed order status transition'
);

select * from finish();
rollback;
