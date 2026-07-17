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
