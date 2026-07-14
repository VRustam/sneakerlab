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
