import type { SupabaseClient } from '@supabase/supabase-js';
import { getCartSummary } from '@/lib/commerce/cart-utils';
import {
  asShippingAddress,
  type CartLine,
  type CartSummary,
  type CheckoutInput,
  type CustomerOrder,
  type CustomerProfile,
  type OrderItemSnapshot,
  type OrderStatus,
} from '@/lib/commerce/types';
import type { Database, Json } from '@/lib/supabase/database.types';

type CommerceClient = SupabaseClient<Database>;
type CartRow = Database['public']['Tables']['cart_items']['Row'];

export class CommerceDataError extends Error {
  constructor(
    public readonly code: 'unavailable' | 'stock' | 'empty' | 'checkout' | 'not-found' | 'unknown',
  ) {
    super(code);
    this.name = 'CommerceDataError';
  }
}

function throwOnError(error: { message: string } | null, code: CommerceDataError['code']) {
  if (error) throw new CommerceDataError(code);
}

function asOrderStatus(status: string): OrderStatus {
  return ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)
    ? (status as OrderStatus)
    : 'pending';
}

function mapOrderItems(
  rows: Database['public']['Tables']['order_items']['Row'][],
): OrderItemSnapshot[] {
  return rows.map((item) => ({
    id: item.id,
    productName: item.product_name,
    productImageUrl: item.product_image_url,
    selectedSize: item.selected_size,
    selectedColor: item.selected_color,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    totalPrice: item.total_price,
  }));
}

export class SupabaseCommerceRepository {
  constructor(private readonly client: CommerceClient) {}

  async getCart(userId: string): Promise<CartSummary> {
    const { data: cartRows, error: cartError } = await this.client
      .from('cart_items')
      .select('id, user_id, product_id, product_variant_id, quantity, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    throwOnError(cartError, 'unknown');
    return getCartSummary(await this.hydrateCartRows(cartRows ?? []));
  }

  async getCartItemCount(userId: string) {
    const cart = await this.getCart(userId);
    return cart.itemCount;
  }

  async addCartLine(userId: string, productId: string, variantId: string | null, quantity = 1) {
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new CommerceDataError('stock');
    }
    const availableStock = await this.getAvailableStock(productId, variantId);
    const existing = await this.findCartLine(userId, productId, variantId);
    const nextQuantity = (existing?.quantity ?? 0) + quantity;
    if (nextQuantity > availableStock) throw new CommerceDataError('stock');

    if (existing) {
      const { error } = await this.client
        .from('cart_items')
        .update({ quantity: nextQuantity })
        .eq('id', existing.id)
        .eq('user_id', userId);
      throwOnError(error, 'unknown');
      return;
    }

    const { error } = await this.client.from('cart_items').insert({
      user_id: userId,
      product_id: productId,
      product_variant_id: variantId,
      quantity,
    });
    throwOnError(error, 'unknown');
  }

  async updateCartLineQuantity(userId: string, cartItemId: string, quantity: number) {
    if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > 99) {
      throw new CommerceDataError('stock');
    }
    const { data: line, error } = await this.client
      .from('cart_items')
      .select('id, user_id, product_id, product_variant_id, quantity, created_at, updated_at')
      .eq('id', cartItemId)
      .eq('user_id', userId)
      .maybeSingle();
    throwOnError(error, 'unknown');
    if (!line) throw new CommerceDataError('not-found');

    if (quantity === 0) return this.removeCartLine(userId, cartItemId);

    const availableStock = await this.getAvailableStock(line.product_id, line.product_variant_id);
    if (quantity > availableStock) throw new CommerceDataError('stock');

    const { error: updateError } = await this.client
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .eq('user_id', userId);
    throwOnError(updateError, 'unknown');
  }

  async removeCartLine(userId: string, cartItemId: string) {
    const { error } = await this.client
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', userId);
    throwOnError(error, 'unknown');
  }

  async mergeGuestLines(
    userId: string,
    lines: Array<{ productId: string; variantId: string | null; quantity: number }>,
  ) {
    let merged = 0;
    let skipped = 0;
    for (const line of lines) {
      try {
        await this.addCartLine(userId, line.productId, line.variantId, line.quantity);
        merged += 1;
      } catch (error) {
        if (error instanceof CommerceDataError) {
          skipped += 1;
          continue;
        }
        throw error;
      }
    }
    return { merged, skipped };
  }

  async placeOrder(userId: string, input: CheckoutInput) {
    const { data: orderId, error } = await this.client.rpc('create_order_from_cart', {
      p_customer_name: input.customerName,
      p_customer_email: input.customerEmail,
      p_shipping_address: input.shippingAddress as unknown as Json,
      p_shipping_cost: 0,
      p_idempotency_key: input.idempotencyKey,
      p_coupon_code: input.couponCode,
    });
    if (error || !orderId) throw new CommerceDataError(this.getCheckoutErrorCode(error?.message));

    const order = await this.getOrderById(userId, orderId);
    if (!order) throw new CommerceDataError('checkout');
    return order;
  }

  async getOrders(userId: string) {
    const { data, error } = await this.client
      .from('orders')
      .select(
        'id, user_id, order_number, subtotal, shipping_cost, total, status, customer_name, customer_email, shipping_address, idempotency_key, created_at, updated_at',
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    throwOnError(error, 'unknown');
    return (data ?? []).map((order) => this.mapOrder(order, []));
  }

  async getOrderByNumber(userId: string, orderNumber: string) {
    const { data, error } = await this.client
      .from('orders')
      .select(
        'id, user_id, order_number, subtotal, shipping_cost, total, status, customer_name, customer_email, shipping_address, idempotency_key, created_at, updated_at',
      )
      .eq('user_id', userId)
      .eq('order_number', orderNumber)
      .maybeSingle();
    throwOnError(error, 'unknown');
    return data ? this.hydrateOrder(data) : null;
  }

  async getProfile(userId: string): Promise<CustomerProfile> {
    const { data, error } = await this.client
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', userId)
      .maybeSingle();
    throwOnError(error, 'unknown');
    return { fullName: data?.full_name ?? null, avatarUrl: data?.avatar_url ?? null };
  }

  async updateProfile(userId: string, fullName: string, avatarPath?: string) {
    const { error } = await this.client
      .from('profiles')
      .update({ full_name: fullName, ...(avatarPath ? { avatar_url: avatarPath } : {}) })
      .eq('id', userId);
    throwOnError(error, 'unknown');
  }

  async updateAvatar(userId: string, avatarPath: string) {
    const { error } = await this.client
      .from('profiles')
      .update({ avatar_url: avatarPath })
      .eq('id', userId);
    throwOnError(error, 'unknown');
  }

  async getAvatarUrl(path: string) {
    const { data, error } = await this.client.storage
      .from('avatars')
      .createSignedUrl(path, 60 * 60);
    if (error) return null;
    return data.signedUrl;
  }

  private async hydrateOrder(order: Database['public']['Tables']['orders']['Row']) {
    const { data: items, error } = await this.client
      .from('order_items')
      .select(
        'id, order_id, product_id, product_name, product_image_url, selected_size, selected_color, quantity, unit_price, total_price, created_at',
      )
      .eq('order_id', order.id)
      .order('created_at', { ascending: true });
    throwOnError(error, 'unknown');
    return this.mapOrder(order, mapOrderItems(items ?? []));
  }

  private mapOrder(
    order: Database['public']['Tables']['orders']['Row'],
    items: OrderItemSnapshot[],
  ): CustomerOrder {
    return {
      id: order.id,
      orderNumber: order.order_number,
      subtotal: order.subtotal,
      shippingCost: order.shipping_cost,
      total: order.total,
      status: asOrderStatus(order.status),
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      shippingAddress: asShippingAddress(order.shipping_address),
      createdAt: order.created_at,
      items,
    };
  }

  private async getOrderById(userId: string, orderId: string) {
    const { data, error } = await this.client
      .from('orders')
      .select(
        'id, user_id, order_number, subtotal, shipping_cost, total, status, customer_name, customer_email, shipping_address, idempotency_key, created_at, updated_at',
      )
      .eq('user_id', userId)
      .eq('id', orderId)
      .maybeSingle();
    throwOnError(error, 'unknown');
    return data ? this.hydrateOrder(data) : null;
  }

  private async findCartLine(userId: string, productId: string, variantId: string | null) {
    let query = this.client
      .from('cart_items')
      .select('id, user_id, product_id, product_variant_id, quantity, created_at, updated_at')
      .eq('user_id', userId)
      .eq('product_id', productId);
    query = variantId
      ? query.eq('product_variant_id', variantId)
      : query.is('product_variant_id', null);
    const { data, error } = await query.maybeSingle();
    throwOnError(error, 'unknown');
    return data;
  }

  private async getAvailableStock(productId: string, variantId: string | null) {
    const { data: product, error: productError } = await this.client
      .from('products')
      .select('id, stock, is_active')
      .eq('id', productId)
      .eq('is_active', true)
      .maybeSingle();
    throwOnError(productError, 'unknown');
    if (!product) throw new CommerceDataError('unavailable');

    if (!variantId) return product.stock;

    const { data: variant, error: variantError } = await this.client
      .from('product_variants')
      .select('id, product_id, stock')
      .eq('id', variantId)
      .eq('product_id', productId)
      .maybeSingle();
    throwOnError(variantError, 'unknown');
    if (!variant) throw new CommerceDataError('unavailable');
    return variant.stock;
  }

  private async hydrateCartRows(rows: CartRow[]): Promise<CartLine[]> {
    if (rows.length === 0) return [];

    const productIds = Array.from(new Set(rows.map((line) => line.product_id)));
    const variantIds = Array.from(
      new Set(rows.flatMap((line) => (line.product_variant_id ? [line.product_variant_id] : []))),
    );
    const [productsResult, variantsResult, imagesResult] = await Promise.all([
      this.client
        .from('products')
        .select('id, name, image_url, price, stock, is_active')
        .in('id', productIds),
      variantIds.length > 0
        ? this.client
            .from('product_variants')
            .select('id, product_id, color_name, size, stock')
            .in('id', variantIds)
        : Promise.resolve({ data: [] as never[], error: null }),
      this.client
        .from('product_images')
        .select('product_id, image_url, sort_order')
        .in('product_id', productIds)
        .order('sort_order', { ascending: true }),
    ]);
    throwOnError(productsResult.error, 'unknown');
    throwOnError(variantsResult.error, 'unknown');
    throwOnError(imagesResult.error, 'unknown');

    const imagesByProduct = new Map<string, string>();
    for (const image of imagesResult.data ?? []) {
      if (!imagesByProduct.has(image.product_id))
        imagesByProduct.set(image.product_id, image.image_url);
    }
    const productsById = new Map(
      (productsResult.data ?? []).map((product) => [
        product.id,
        {
          id: product.id,
          name: product.name,
          imageUrl: imagesByProduct.get(product.id) ?? product.image_url,
          price: product.price,
          stock: product.stock,
          isActive: product.is_active,
        },
      ]),
    );
    const variantsById = new Map(
      (variantsResult.data ?? []).map((variant) => [
        variant.id,
        {
          id: variant.id,
          colorName: variant.color_name,
          size: variant.size,
          stock: variant.stock,
        },
      ]),
    );

    return rows.map((line) => {
      const product = productsById.get(line.product_id) ?? null;
      const variant = line.product_variant_id
        ? (variantsById.get(line.product_variant_id) ?? null)
        : null;
      const availableStock = variant ? variant.stock : (product?.stock ?? 0);
      const isAvailable = Boolean(
        product?.isActive && (!line.product_variant_id || variant) && availableStock > 0,
      );
      return {
        id: line.id,
        productId: line.product_id,
        variantId: line.product_variant_id,
        quantity: line.quantity,
        product,
        variant,
        availableStock,
        isAvailable,
      };
    });
  }

  private getCheckoutErrorCode(message?: string) {
    const normalized = message?.toLowerCase() ?? '';
    if (normalized.includes('empty')) return 'empty';
    if (normalized.includes('unavailable')) return 'unavailable';
    if (normalized.includes('stock')) return 'stock';
    return 'checkout';
  }
}
