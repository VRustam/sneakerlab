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
