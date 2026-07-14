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
