create extension if not exists pgcrypto;

-- Drop existing tables to perform a clean database reset
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.cart_items cascade;
drop table if exists public.product_variants cascade;
drop table if exists public.product_images cascade;
drop table if exists public.favorites cascade;
drop table if exists public.products cascade;
drop table if exists public.categories cascade;
drop table if exists public.profiles cascade;
drop table if exists public.coupons cascade;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  slug text not null unique check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  name text not null check (char_length(trim(name)) > 0),
  slug text not null unique check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  short_description text,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  compare_at_price numeric(12, 2) check (compare_at_price is null or compare_at_price > 0),
  image_url text,
  model_3d_url text,
  stock integer not null default 0 check (stock >= 0),
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  image_url text not null check (char_length(trim(image_url)) > 0),
  alt_text text,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (product_id, sort_order)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  color_name text not null check (char_length(trim(color_name)) > 0),
  color_hex text check (color_hex is null or color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  size text not null check (char_length(trim(size)) > 0),
  stock integer not null default 0 check (stock >= 0),
  sku text not null unique check (char_length(trim(sku)) > 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (product_id, color_name, size)
);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, product_id)
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  product_variant_id uuid references public.product_variants (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index cart_items_unique_logical_line
  on public.cart_items (user_id, product_id, coalesce(product_variant_id, '00000000-0000-0000-0000-000000000000'::uuid));

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete restrict,
  order_number text not null unique check (order_number ~ '^SL-[0-9]{8}-[A-Z0-9]{8}$'),
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  shipping_cost numeric(12, 2) not null default 0 check (shipping_cost >= 0),
  total numeric(12, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  customer_name text not null check (char_length(trim(customer_name)) > 0),
  customer_email text not null check (customer_email ~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'),
  shipping_address jsonb not null check (jsonb_typeof(shipping_address) = 'object'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint orders_total_check check (total >= 0 and total = round(subtotal + shipping_cost, 2))
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  product_image_url text,
  selected_size text,
  selected_color text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  total_price numeric(12, 2) not null check (total_price >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  check (total_price = round(unit_price * quantity, 2))
);

create index categories_active_slug_idx on public.categories (is_active, slug);
create index products_public_catalog_idx on public.products (is_active, is_featured, category_id, created_at desc);
create index products_price_idx on public.products (is_active, price);
create index product_images_product_sort_idx on public.product_images (product_id, sort_order);
create index product_variants_product_idx on public.product_variants (product_id);
create index favorites_user_idx on public.favorites (user_id, created_at desc);
create index cart_items_user_idx on public.cart_items (user_id, updated_at desc);
create index orders_user_created_idx on public.orders (user_id, created_at desc);
create index orders_status_created_idx on public.orders (status, created_at desc);
create index order_items_order_idx on public.order_items (order_id);
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create function public.prevent_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
    and current_user not in ('postgres', 'service_role', 'supabase_admin')
    and not public.is_admin() then
    raise exception 'Profile roles can only be changed by an administrator.';
  end if;
  return new;
end;
$$;

create function public.next_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate text;
begin
  loop
    candidate := 'SL-' || to_char(timezone('utc', now()), 'YYYYMMDD') || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 8));
    exit when not exists (select 1 from public.orders where order_number = candidate);
  end loop;
  return candidate;
end;
$$;

create function public.is_valid_order_status_transition(current_status text, next_status text)
returns boolean
language sql
immutable
as $$
  select current_status = next_status
    or (current_status = 'pending' and next_status in ('processing', 'cancelled'))
    or (current_status = 'processing' and next_status in ('shipped', 'cancelled'))
    or (current_status = 'shipped' and next_status = 'delivered');
$$;

create function public.enforce_order_status_transition()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not public.is_valid_order_status_transition(old.status, new.status) then
    raise exception 'Invalid order status transition from % to %.', old.status, new.status;
  end if;
  return new;
end;
$$;

create function public.validate_cart_item_variant()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.product_variant_id is not null and not exists (
    select 1
    from public.product_variants
    where id = new.product_variant_id and product_id = new.product_id
  ) then
    raise exception 'The selected variant does not belong to this product.';
  end if;
  return new;
end;
$$;

create function public.enforce_order_immutable_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (to_jsonb(new) - 'status' - 'updated_at') is distinct from (to_jsonb(old) - 'status' - 'updated_at') then
    raise exception 'Order snapshots and totals are immutable after creation.';
  end if;
  return new;
end;
$$;

create function public.create_order_from_cart(
  p_customer_name text,
  p_customer_email text,
  p_shipping_address jsonb,
  p_shipping_cost numeric default 0
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_subtotal numeric(12, 2) := 0;
  v_shipping_cost numeric(12, 2) := coalesce(p_shipping_cost, 0);
  v_line record;
  v_product public.products%rowtype;
  v_variant public.product_variants%rowtype;
  v_available_stock integer;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to place an order.';
  end if;

  if coalesce(trim(p_customer_name), '') = '' then
    raise exception 'A customer name is required.';
  end if;

  if coalesce(trim(p_customer_email), '') !~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
    raise exception 'A valid customer email is required.';
  end if;

  if jsonb_typeof(p_shipping_address) <> 'object' then
    raise exception 'A shipping address object is required.';
  end if;

  if v_shipping_cost < 0 then
    raise exception 'Shipping cost cannot be negative.';
  end if;

  if not exists (select 1 from public.cart_items where user_id = v_user_id) then
    raise exception 'Your cart is empty.';
  end if;

  for v_line in
    select * from public.cart_items where user_id = v_user_id order by created_at for update
  loop
    select * into v_product from public.products where id = v_line.product_id for update;
    if not found or not v_product.is_active then
      raise exception 'A cart product is unavailable.';
    end if;

    if v_line.product_variant_id is not null then
      select * into v_variant from public.product_variants where id = v_line.product_variant_id for update;
      if not found or v_variant.product_id <> v_product.id then
        raise exception 'A cart variant is unavailable.';
      end if;
      v_available_stock := v_variant.stock;
    else
      v_available_stock := v_product.stock;
    end if;

    if v_line.quantity > v_available_stock then
      raise exception 'Insufficient stock for product %.', v_product.name;
    end if;

    v_subtotal := round(v_subtotal + (v_product.price * v_line.quantity), 2);
  end loop;

  insert into public.orders (
    user_id,
    order_number,
    subtotal,
    shipping_cost,
    total,
    customer_name,
    customer_email,
    shipping_address
  )
  values (
    v_user_id,
    public.next_order_number(),
    v_subtotal,
    v_shipping_cost,
    round(v_subtotal + v_shipping_cost, 2),
    trim(p_customer_name),
    lower(trim(p_customer_email)),
    p_shipping_address
  )
  returning id into v_order_id;

  for v_line in
    select * from public.cart_items where user_id = v_user_id order by created_at
  loop
    select * into v_product from public.products where id = v_line.product_id;
    if v_line.product_variant_id is not null then
      select * into v_variant from public.product_variants where id = v_line.product_variant_id;
    end if;

    insert into public.order_items (
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
      v_order_id,
      v_product.id,
      v_product.name,
      v_product.image_url,
      case when v_line.product_variant_id is null then null else v_variant.size end,
      case when v_line.product_variant_id is null then null else v_variant.color_name end,
      v_line.quantity,
      v_product.price,
      round(v_product.price * v_line.quantity, 2)
    );

    if v_line.product_variant_id is null then
      update public.products set stock = stock - v_line.quantity where id = v_product.id;
    else
      update public.product_variants set stock = stock - v_line.quantity where id = v_variant.id;
    end if;
  end loop;

  delete from public.cart_items where user_id = v_user_id;
  return v_order_id;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

create trigger cart_items_validate_variant
before insert or update of product_id, product_variant_id on public.cart_items
for each row execute function public.validate_cart_item_variant();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger profiles_prevent_role_change
before update on public.profiles
for each row execute function public.prevent_profile_role_change();

create trigger orders_enforce_status_transition
before update on public.orders
for each row execute function public.enforce_order_status_transition();

create trigger orders_enforce_immutable_fields
before update on public.orders
for each row execute function public.enforce_order_immutable_fields();

drop trigger if exists auth_user_creates_profile on auth.users;
create trigger auth_user_creates_profile
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.favorites enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products, public.product_images, public.product_variants to anon, authenticated;
grant select, insert, update, delete on public.categories, public.products, public.product_images, public.product_variants to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.favorites, public.cart_items to authenticated;
grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.create_order_from_cart(text, text, jsonb, numeric) to authenticated;
revoke all on function public.set_updated_at() from public;
revoke all on function public.handle_new_user() from public;
revoke all on function public.prevent_profile_role_change() from public;
revoke all on function public.next_order_number() from public;
revoke all on function public.is_valid_order_status_transition(text, text) from public;
revoke all on function public.enforce_order_status_transition() from public;
revoke all on function public.validate_cart_item_variant() from public;
revoke all on function public.enforce_order_immutable_fields() from public;

create policy "profiles_select_own_or_admin"
on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin"
on public.profiles for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "categories_read_active"
on public.categories for select to anon, authenticated
using (is_active or public.is_admin());

create policy "categories_admin_manage"
on public.categories for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "products_read_active"
on public.products for select to anon, authenticated
using (is_active or public.is_admin());

create policy "products_admin_manage"
on public.products for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "product_images_read_for_visible_product"
on public.product_images for select to anon, authenticated
using (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
      and (products.is_active or public.is_admin())
  )
);

create policy "product_images_admin_manage"
on public.product_images for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "product_variants_read_for_visible_product"
on public.product_variants for select to anon, authenticated
using (
  exists (
    select 1 from public.products
    where products.id = product_variants.product_id
      and (products.is_active or public.is_admin())
  )
);

create policy "product_variants_admin_manage"
on public.product_variants for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "favorites_manage_own"
on public.favorites for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "cart_items_manage_own"
on public.cart_items for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "orders_select_own_or_admin"
on public.orders for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "orders_admin_manage"
on public.orders for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "order_items_select_own_or_admin"
on public.order_items for select to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.orders
    where orders.id = order_items.order_id and orders.user_id = auth.uid()
  )
);
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('product-models', 'product-models', true, 20971520, array['model/gltf-binary', 'model/gltf+json', 'application/octet-stream']),
  ('avatars', 'avatars', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "product_images_public_read"
on storage.objects for select to public
using (bucket_id = 'product-images');

create policy "product_images_admin_insert"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'product-images'
  and name like 'products/%'
  and public.is_admin()
  and coalesce(metadata ->> 'mimetype', '') in ('image/jpeg', 'image/png', 'image/webp')
);

create policy "product_images_admin_update"
on storage.objects for update to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (
  bucket_id = 'product-images'
  and name like 'products/%'
  and public.is_admin()
  and coalesce(metadata ->> 'mimetype', '') in ('image/jpeg', 'image/png', 'image/webp')
);

create policy "product_images_admin_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'product-images' and public.is_admin());

create policy "product_models_public_read"
on storage.objects for select to public
using (bucket_id = 'product-models');

create policy "product_models_admin_insert"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'product-models'
  and name like 'models/%'
  and public.is_admin()
  and coalesce(metadata ->> 'mimetype', '') in ('model/gltf-binary', 'model/gltf+json', 'application/octet-stream')
);

create policy "product_models_admin_update"
on storage.objects for update to authenticated
using (bucket_id = 'product-models' and public.is_admin())
with check (
  bucket_id = 'product-models'
  and name like 'models/%'
  and public.is_admin()
  and coalesce(metadata ->> 'mimetype', '') in ('model/gltf-binary', 'model/gltf+json', 'application/octet-stream')
);

create policy "product_models_admin_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'product-models' and public.is_admin());

create policy "avatars_read_own"
on storage.objects for select to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatars_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
  and coalesce(metadata ->> 'mimetype', '') in ('image/jpeg', 'image/png', 'image/webp')
);

create policy "avatars_update_own"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
  and coalesce(metadata ->> 'mimetype', '') in ('image/jpeg', 'image/png', 'image/webp')
);

create policy "avatars_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
alter table public.orders
  add column idempotency_key uuid;

create unique index orders_user_idempotency_key_idx
  on public.orders (user_id, idempotency_key)
  where idempotency_key is not null;

drop function if exists public.create_order_from_cart(text, text, jsonb, numeric);

create function public.create_order_from_cart(
  p_customer_name text,
  p_customer_email text,
  p_shipping_address jsonb,
  p_shipping_cost numeric default 0,
  p_idempotency_key uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_subtotal numeric(12, 2) := 0;
  v_shipping_cost numeric(12, 2) := coalesce(p_shipping_cost, 0);
  v_line record;
  v_product public.products%rowtype;
  v_variant public.product_variants%rowtype;
  v_available_stock integer;
  v_has_cart_line boolean := false;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to place an order.';
  end if;

  if p_idempotency_key is null then
    raise exception 'A checkout identifier is required.';
  end if;

  select id into v_order_id
  from public.orders
  where user_id = v_user_id and idempotency_key = p_idempotency_key
  for update;

  if found then
    return v_order_id;
  end if;

  if coalesce(trim(p_customer_name), '') = '' then
    raise exception 'A customer name is required.';
  end if;

  if coalesce(trim(p_customer_email), '') !~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
    raise exception 'A valid customer email is required.';
  end if;

  if jsonb_typeof(p_shipping_address) <> 'object' then
    raise exception 'A shipping address object is required.';
  end if;

  if v_shipping_cost < 0 then
    raise exception 'Shipping cost cannot be negative.';
  end if;

  for v_line in
    select * from public.cart_items where user_id = v_user_id order by created_at for update
  loop
    v_has_cart_line := true;
    select * into v_product from public.products where id = v_line.product_id for update;
    if not found or not v_product.is_active then
      raise exception 'A cart product is unavailable.';
    end if;

    if v_line.product_variant_id is not null then
      select * into v_variant from public.product_variants where id = v_line.product_variant_id for update;
      if not found or v_variant.product_id <> v_product.id then
        raise exception 'A cart variant is unavailable.';
      end if;
      v_available_stock := v_variant.stock;
    else
      v_available_stock := v_product.stock;
    end if;

    if v_line.quantity > v_available_stock then
      raise exception 'Insufficient stock for product %.', v_product.name;
    end if;

    v_subtotal := round(v_subtotal + (v_product.price * v_line.quantity), 2);
  end loop;

  if not v_has_cart_line then
    select id into v_order_id
    from public.orders
    where user_id = v_user_id and idempotency_key = p_idempotency_key;
    if found then
      return v_order_id;
    end if;
    raise exception 'Your cart is empty.';
  end if;

  begin
    insert into public.orders (
      user_id,
      order_number,
      subtotal,
      shipping_cost,
      total,
      customer_name,
      customer_email,
      shipping_address,
      idempotency_key
    )
    values (
      v_user_id,
      public.next_order_number(),
      v_subtotal,
      v_shipping_cost,
      round(v_subtotal + v_shipping_cost, 2),
      trim(p_customer_name),
      lower(trim(p_customer_email)),
      p_shipping_address,
      p_idempotency_key
    )
    returning id into v_order_id;
  exception
    when unique_violation then
      select id into v_order_id
      from public.orders
      where user_id = v_user_id and idempotency_key = p_idempotency_key;
      if found then
        return v_order_id;
      end if;
      raise;
  end;

  for v_line in
    select * from public.cart_items where user_id = v_user_id order by created_at
  loop
    select * into v_product from public.products where id = v_line.product_id;
    if v_line.product_variant_id is not null then
      select * into v_variant from public.product_variants where id = v_line.product_variant_id;
    end if;

    insert into public.order_items (
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
      v_order_id,
      v_product.id,
      v_product.name,
      v_product.image_url,
      case when v_line.product_variant_id is null then null else v_variant.size end,
      case when v_line.product_variant_id is null then null else v_variant.color_name end,
      v_line.quantity,
      v_product.price,
      round(v_product.price * v_line.quantity, 2)
    );

    if v_line.product_variant_id is null then
      update public.products set stock = stock - v_line.quantity where id = v_product.id;
    else
      update public.product_variants set stock = stock - v_line.quantity where id = v_variant.id;
    end if;
  end loop;

  delete from public.cart_items where user_id = v_user_id;
  return v_order_id;
end;
$$;

grant execute on function public.create_order_from_cart(text, text, jsonb, numeric, uuid) to authenticated;
-- The status trigger runs in the authenticated request context. Its pure
-- validator must therefore be executable by that role; direct order updates
-- remain protected by the admin-only RLS policy.
grant execute on function public.is_valid_order_status_transition(text, text) to authenticated;
-- Full-text search support for products catalog.
-- Adds a generated tsvector column with a GIN index for fast prefix and
-- relevance-ranked search across product name, description, and category.

alter table public.products
  add column search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(short_description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) stored;

create index products_search_idx on public.products using gin (search_vector);

-- Also add a trigram index for partial / fuzzy matching on product name.
create extension if not exists pg_trgm;
create index products_name_trgm_idx on public.products using gin (name gin_trgm_ops);
-- Coupon / discount code support.
-- Adds a coupons table and links it to orders for discount tracking.

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (char_length(trim(code)) > 0),
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(12, 2) not null check (discount_value > 0),
  min_order_amount numeric(12, 2) not null default 0 check (min_order_amount >= 0),
  max_discount_amount numeric(12, 2) check (max_discount_amount is null or max_discount_amount > 0),
  max_uses integer check (max_uses is null or max_uses > 0),
  current_uses integer not null default 0 check (current_uses >= 0),
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (starts_at is null or expires_at is null or starts_at < expires_at)
);

create index coupons_code_active_idx on public.coupons (upper(code), is_active);

-- Add coupon reference to orders
alter table public.orders
  add column coupon_id uuid references public.coupons (id) on delete set null,
  add column discount_amount numeric(12, 2) not null default 0 check (discount_amount >= 0);

-- Update total check to account for discount
alter table public.orders
  drop constraint orders_total_check;
alter table public.orders
  add constraint orders_total_check
  check (total >= 0 and total = round(subtotal + shipping_cost - discount_amount, 2));

-- RLS policies for coupons
alter table public.coupons enable row level security;

-- Admin: full access
create policy coupons_admin_all on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

-- Authenticated users: can read active coupons (for validation)
create policy coupons_customer_read on public.coupons
  for select using (
    auth.role() = 'authenticated'
    and is_active = true
    and (starts_at is null or starts_at <= now())
    and (expires_at is null or expires_at > now())
    and (max_uses is null or current_uses < max_uses)
  );

-- Validate coupon RPC
create or replace function public.validate_coupon(coupon_code text, order_subtotal numeric)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coupon record;
  v_discount numeric(12, 2);
begin
  select * into v_coupon
  from public.coupons
  where upper(code) = upper(coupon_code)
    and is_active = true
    and (starts_at is null or starts_at <= now())
    and (expires_at is null or expires_at > now())
    and (max_uses is null or current_uses < max_uses);

  if not found then
    return jsonb_build_object('valid', false, 'error', 'Invalid or expired coupon code.');
  end if;

  if order_subtotal < v_coupon.min_order_amount then
    return jsonb_build_object(
      'valid', false,
      'error', format('Minimum order amount is $%s.', v_coupon.min_order_amount)
    );
  end if;

  if v_coupon.discount_type = 'percentage' then
    v_discount := round(order_subtotal * v_coupon.discount_value / 100, 2);
  else
    v_discount := v_coupon.discount_value;
  end if;

  -- Cap discount
  if v_coupon.max_discount_amount is not null and v_discount > v_coupon.max_discount_amount then
    v_discount := v_coupon.max_discount_amount;
  end if;

  -- Never discount more than the subtotal
  if v_discount > order_subtotal then
    v_discount := order_subtotal;
  end if;

  return jsonb_build_object(
    'valid', true,
    'coupon_id', v_coupon.id,
    'code', v_coupon.code,
    'discount_type', v_coupon.discount_type,
    'discount_value', v_coupon.discount_value,
    'discount_amount', v_discount,
    'description', coalesce(v_coupon.description, '')
  );
end;
$$;

-- Grant execute to authenticated users
grant execute on function public.validate_coupon(text, numeric) to authenticated;
-- Override create_order_from_cart to support discount coupons.

drop function if exists public.create_order_from_cart(text, text, jsonb, numeric, uuid);

create or replace function public.create_order_from_cart(
  p_customer_name text,
  p_customer_email text,
  p_shipping_address jsonb,
  p_shipping_cost numeric default 0,
  p_idempotency_key uuid default null,
  p_coupon_code text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_subtotal numeric(12, 2) := 0;
  v_shipping_cost numeric(12, 2) := coalesce(p_shipping_cost, 0);
  v_line record;
  v_product public.products%rowtype;
  v_variant public.product_variants%rowtype;
  v_available_stock integer;
  v_has_cart_line boolean := false;
  
  -- Coupon variables
  v_coupon record;
  v_coupon_id uuid := null;
  v_discount_amount numeric(12, 2) := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to place an order.';
  end if;

  if p_idempotency_key is null then
    raise exception 'A checkout identifier is required.';
  end if;

  -- Return existing order if idempotency matches
  select id into v_order_id
  from public.orders
  where user_id = v_user_id and idempotency_key = p_idempotency_key
  for update;

  if found then
    return v_order_id;
  end if;

  if coalesce(trim(p_customer_name), '') = '' then
    raise exception 'A customer name is required.';
  end if;

  if coalesce(trim(p_customer_email), '') !~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
    raise exception 'A valid customer email is required.';
  end if;

  if jsonb_typeof(p_shipping_address) <> 'object' then
    raise exception 'A shipping address object is required.';
  end if;

  if v_shipping_cost < 0 then
    raise exception 'Shipping cost cannot be negative.';
  end if;

  -- Lock cart and compute subtotal
  for v_line in
    select * from public.cart_items where user_id = v_user_id order by created_at for update
  loop
    v_has_cart_line := true;
    select * into v_product from public.products where id = v_line.product_id for update;
    if not found or not v_product.is_active then
      raise exception 'A cart product is unavailable.';
    end if;

    if v_line.product_variant_id is not null then
      select * into v_variant from public.product_variants where id = v_line.product_variant_id for update;
      if not found or v_variant.product_id <> v_product.id then
        raise exception 'A cart variant is unavailable.';
      end if;
      v_available_stock := v_variant.stock;
    else
      v_available_stock := v_product.stock;
    end if;

    if v_line.quantity > v_available_stock then
      raise exception 'Insufficient stock for product %.', v_product.name;
    end if;

    v_subtotal := round(v_subtotal + (v_product.price * v_line.quantity), 2);
  end loop;

  if not v_has_cart_line then
    select id into v_order_id
    from public.orders
    where user_id = v_user_id and idempotency_key = p_idempotency_key;
    if found then
      return v_order_id;
    end if;
    raise exception 'Your cart is empty.';
  end if;

  -- Validate coupon if provided
  if p_coupon_code is not null and trim(p_coupon_code) <> '' then
    select * into v_coupon
    from public.coupons
    where upper(code) = upper(trim(p_coupon_code))
      and is_active = true
      and (starts_at is null or starts_at <= now())
      and (expires_at is null or expires_at > now())
      and (max_uses is null or current_uses < max_uses)
      for update;

    if found then
      if v_subtotal >= v_coupon.min_order_amount then
        v_coupon_id := v_coupon.id;
        
        if v_coupon.discount_type = 'percentage' then
          v_discount_amount := round(v_subtotal * v_coupon.discount_value / 100, 2);
        else
          v_discount_amount := v_coupon.discount_value;
        end if;

        -- Cap discount amount
        if v_coupon.max_discount_amount is not null and v_discount_amount > v_coupon.max_discount_amount then
          v_discount_amount := v_coupon.max_discount_amount;
        end if;

        -- Max discount is subtotal
        if v_discount_amount > v_subtotal then
          v_discount_amount := v_subtotal;
        end if;

        -- Increment coupon usage
        update public.coupons
        set current_uses = current_uses + 1
        where id = v_coupon.id;
      else
        raise exception 'Minimum order amount is not met for coupon %.', p_coupon_code;
      end if;
    else
      raise exception 'Coupon code % is invalid or expired.', p_coupon_code;
    end if;
  end if;

  -- Create order
  begin
    insert into public.orders (
      user_id,
      order_number,
      subtotal,
      shipping_cost,
      discount_amount,
      total,
      customer_name,
      customer_email,
      shipping_address,
      idempotency_key,
      coupon_id
    )
    values (
      v_user_id,
      public.next_order_number(),
      v_subtotal,
      v_shipping_cost,
      v_discount_amount,
      round(v_subtotal + v_shipping_cost - v_discount_amount, 2),
      trim(p_customer_name),
      lower(trim(p_customer_email)),
      p_shipping_address,
      p_idempotency_key,
      v_coupon_id
    )
    returning id into v_order_id;
  exception
    when unique_violation then
      select id into v_order_id
      from public.orders
      where user_id = v_user_id and idempotency_key = p_idempotency_key;
      if found then
        return v_order_id;
      end if;
      raise;
  end;

  -- Create order items and decrement stock
  for v_line in
    select * from public.cart_items where user_id = v_user_id order by created_at
  loop
    select * into v_product from public.products where id = v_line.product_id;
    if v_line.product_variant_id is not null then
      select * into v_variant from public.product_variants where id = v_line.product_variant_id;
    end if;

    insert into public.order_items (
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
      v_order_id,
      v_product.id,
      v_product.name,
      v_product.image_url,
      case when v_line.product_variant_id is null then null else v_variant.size end,
      case when v_line.product_variant_id is null then null else v_variant.color_name end,
      v_line.quantity,
      v_product.price,
      round(v_product.price * v_line.quantity, 2)
    );

    if v_line.product_variant_id is null then
      update public.products set stock = stock - v_line.quantity where id = v_product.id;
    else
      update public.product_variants set stock = stock - v_line.quantity where id = v_variant.id;
    end if;
  end loop;

  delete from public.cart_items where user_id = v_user_id;
  return v_order_id;
end;
$$;

grant execute on function public.create_order_from_cart(text, text, jsonb, numeric, uuid, text) to authenticated;
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
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
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
    '',
    '',
    '',
    '',
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
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"SneakerLab Customer"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (id) do update
set
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  confirmation_token = excluded.confirmation_token,
  email_change = excluded.email_change,
  email_change_token_new = excluded.email_change_token_new,
  recovery_token = excluded.recovery_token,
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
  ('10000000-0000-0000-0000-000000000001', 'Court', 'court', 'Clean low and mid profile sneakers for everyday rotation.', '/images/products/atlas-court.png', true),
  ('10000000-0000-0000-0000-000000000002', 'Running', 'running', 'Responsive sneakers designed around daily movement.', '/images/products/metro-knit.png', true),
  ('10000000-0000-0000-0000-000000000003', 'Trail', 'trail', 'Durable silhouettes for varied terrain.', '/images/products/vector-trail.png', true),
  ('10000000-0000-0000-0000-000000000004', 'Lifestyle', 'lifestyle', 'Comfort-first styles for the city and weekend.', '/images/products/pulse-layer.png', true)
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  image_url = excluded.image_url,
  is_active = excluded.is_active;

insert into public.products (id, category_id, name, slug, short_description, description, price, compare_at_price, image_url, model_3d_url, stock, is_featured, is_active)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Atlas Court', 'atlas-court', 'A quiet court staple with a structured heel.', 'Atlas Court balances a padded collar, durable cupsole, and flexible everyday leather-free upper.', 110.00, 135.00, '/images/products/atlas-court.png', null, 0, true, true),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Metro Knit', 'metro-knit', 'A breathable daily runner with simple cushioning.', 'Metro Knit uses a lightweight knit upper and a stable foam platform for regular city miles.', 145.00, null, '/images/products/metro-knit.png', null, 25, true, true),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Vector Trail', 'vector-trail', 'A grippy trail sneaker with a precise fit.', 'Vector Trail combines a rugged outsole with supportive overlays for mixed surfaces.', 160.00, 185.00, '/images/products/vector-trail.png', null, 0, false, true),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Form Canvas', 'form-canvas', 'A relaxed canvas low-top with a soft lining.', 'Form Canvas is a pared-back lifestyle sneaker with flexible construction and dependable traction.', 85.00, null, '/images/products/atlas-court.png', null, 12, false, true),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'Shift Runner', 'shift-runner', 'A responsive runner with a stable transition.', 'Shift Runner pairs balanced cushioning with a supportive midfoot frame for everyday runs.', 130.00, null, '/images/products/metro-knit.png', null, 0, true, true),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 'Summit Fabric', 'summit-fabric', 'A weather-ready trail sneaker with confident grip.', 'Summit Fabric features a protective upper and deep lugs for long days beyond pavement.', 175.00, 195.00, '/images/products/vector-trail.png', null, 0, false, true),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'Studio Low', 'studio-low', 'A lightweight court shoe with low-profile comfort.', 'Studio Low keeps the visual language clean with breathable panels and a soft foam sockliner.', 105.00, null, '/images/products/atlas-court.png', null, 18, false, true),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', 'Pulse Layer', 'pulse-layer', 'A layered lifestyle sneaker with an interactive 3D preview.', 'Pulse Layer is a modular lifestyle silhouette with a real-time, interactive 3D product preview.', 120.00, 145.00, '/images/products/pulse-layer.png', '/models/materials-variants-shoe-1024.glb', 0, true, true),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000002', 'Core Motion', 'core-motion', 'A straightforward trainer built for daily movement.', 'Core Motion delivers dependable cushioning and an easy-to-style upper.', 99.00, null, '/images/products/metro-knit.png', null, 30, false, true),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000004', 'Archive Sample', 'archive-sample', 'An inactive fixture used to validate public catalog rules.', 'Archive Sample must never appear in public catalog results.', 80.00, null, '/images/products/pulse-layer.png', null, 0, false, false)
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
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '/images/products/atlas-court.png', 'Atlas Court sneaker in a studio setting', 0),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '/images/products/metro-knit.png', 'Metro Knit sneaker in a studio setting', 0),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '/images/products/vector-trail.png', 'Vector Trail sneaker in a studio setting', 0),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', '/images/products/atlas-court.png', 'Form Canvas sneaker in a studio setting', 0),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', '/images/products/metro-knit.png', 'Shift Runner sneaker in a studio setting', 0),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006', '/images/products/vector-trail.png', 'Summit Fabric sneaker in a studio setting', 0),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000007', '/images/products/atlas-court.png', 'Studio Low sneaker in a studio setting', 0),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000008', '/images/products/pulse-layer.png', 'Pulse Layer sneaker in a studio setting', 0),
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000009', '/images/products/metro-knit.png', 'Core Motion sneaker in a studio setting', 0),
  ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000010', '/images/products/pulse-layer.png', 'Archive Sample sneaker in a studio setting', 0)
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
