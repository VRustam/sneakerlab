import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AdminCategory,
  AdminDashboard,
  AdminOrder,
  AdminOrderDetail,
  AdminPage,
  AdminProduct,
} from '@/lib/admin/types';
import type { AdminOrderStatus } from '@/lib/admin/validation';
import type { Database } from '@/lib/supabase/database.types';

type AdminClient = SupabaseClient<Database>;
type ProductRow = Database['public']['Tables']['products']['Row'];
type OrderRow = Database['public']['Tables']['orders']['Row'];

const productFields =
  'id, category_id, name, slug, short_description, description, price, compare_at_price, image_url, model_3d_url, stock, is_featured, is_active, created_at, updated_at';
const orderFields =
  'id, user_id, order_number, subtotal, shipping_cost, total, status, customer_name, customer_email, shipping_address, idempotency_key, created_at, updated_at';
const pageSize = 20;

export class AdminDataError extends Error {
  constructor(context: string) {
    super('Admin data could not be loaded: ' + context + '.');
    this.name = 'AdminDataError';
  }
}

function throwOnError(error: { message: string } | null, context: string) {
  if (error) throw new AdminDataError(context);
}

function cleanSearch(value: string) {
  return value
    .replace(/[%,()]/g, ' ')
    .trim()
    .slice(0, 120);
}

function asOrderStatus(status: string): AdminOrderStatus {
  return ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)
    ? (status as AdminOrderStatus)
    : 'pending';
}

export class SupabaseAdminRepository {
  constructor(private readonly client: AdminClient) {}

  async getDashboard(): Promise<AdminDashboard> {
    const [productsResult, variantsResult, ordersResult] = await Promise.all([
      this.client.from('products').select('id, stock, is_active'),
      this.client.from('product_variants').select('id, product_id, stock'),
      this.client.from('orders').select(orderFields).order('created_at', { ascending: false }),
    ]);
    throwOnError(productsResult.error, 'dashboard products');
    throwOnError(variantsResult.error, 'dashboard variants');
    throwOnError(ordersResult.error, 'dashboard orders');

    const activeProductIds = new Set(
      (productsResult.data ?? [])
        .filter((product) => product.is_active)
        .map((product) => product.id),
    );
    const activeProducts = (productsResult.data ?? []).filter((product) => product.is_active);
    const lowProductStock = activeProducts.filter((product) => product.stock <= 3).length;
    const lowVariantStock = (variantsResult.data ?? []).filter(
      (variant) => activeProductIds.has(variant.product_id) && variant.stock <= 3,
    ).length;
    const orders = ordersResult.data ?? [];
    const recentOrders = await this.withProfileNames(orders.slice(0, 6));

    return {
      activeProductCount: activeProducts.length,
      lowStockCount: lowProductStock + lowVariantStock,
      totalOrderCount: orders.length,
      pendingOrProcessingCount: orders.filter(
        (order) => order.status === 'pending' || order.status === 'processing',
      ).length,
      grossOrderValue: orders
        .filter((order) => order.status !== 'cancelled')
        .reduce((sum, order) => sum + order.total, 0),
      recentOrders,
    };
  }

  async listProducts(search: string, requestedPage: number): Promise<AdminPage<AdminProduct>> {
    const page = Math.max(1, requestedPage);
    const offset = (page - 1) * pageSize;
    let query = this.client.from('products').select(productFields, { count: 'exact' });
    const term = cleanSearch(search);
    if (term) query = query.or('name.ilike.%' + term + '%,slug.ilike.%' + term + '%');
    const { data, error, count } = await query
      .order('updated_at', { ascending: false })
      .range(offset, offset + pageSize - 1);
    throwOnError(error, 'products');
    const rows = await this.hydrateProducts(data ?? []);
    const totalCount = count ?? 0;
    return {
      rows,
      page,
      pageSize,
      totalCount,
      hasNextPage: offset + rows.length < totalCount,
    };
  }

  async getProduct(id: string): Promise<AdminProduct | null> {
    const { data, error } = await this.client
      .from('products')
      .select(productFields)
      .eq('id', id)
      .maybeSingle();
    throwOnError(error, 'product');
    if (!data) return null;
    const [product] = await this.hydrateProducts([data]);
    return product ?? null;
  }

  async listCategories(): Promise<AdminCategory[]> {
    const [categoriesResult, productsResult] = await Promise.all([
      this.client
        .from('categories')
        .select('id, name, slug, description, image_url, is_active, created_at, updated_at')
        .order('name'),
      this.client.from('products').select('category_id'),
    ]);
    throwOnError(categoriesResult.error, 'categories');
    throwOnError(productsResult.error, 'category product counts');

    const counts = new Map<string, number>();
    for (const product of productsResult.data ?? []) {
      if (product.category_id)
        counts.set(product.category_id, (counts.get(product.category_id) ?? 0) + 1);
    }
    return (categoriesResult.data ?? []).map((category) => ({
      ...category,
      productCount: counts.get(category.id) ?? 0,
    }));
  }

  async listOrders(
    search: string,
    status: AdminOrderStatus | '',
    requestedPage: number,
  ): Promise<AdminPage<AdminOrder>> {
    const page = Math.max(1, requestedPage);
    const offset = (page - 1) * pageSize;
    let query = this.client.from('orders').select(orderFields, { count: 'exact' });
    const term = cleanSearch(search);
    if (term) {
      query = query.or('order_number.ilike.%' + term + '%,customer_email.ilike.%' + term + '%');
    }
    if (status) query = query.eq('status', status);
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);
    throwOnError(error, 'orders');
    const rows = await this.withProfileNames(data ?? []);
    const totalCount = count ?? 0;
    return {
      rows,
      page,
      pageSize,
      totalCount,
      hasNextPage: offset + rows.length < totalCount,
    };
  }

  async getOrder(id: string): Promise<AdminOrderDetail | null> {
    const { data: order, error: orderError } = await this.client
      .from('orders')
      .select(orderFields)
      .eq('id', id)
      .maybeSingle();
    throwOnError(orderError, 'order');
    if (!order) return null;
    const [withProfile] = await this.withProfileNames([order]);
    if (!withProfile) return null;
    const { data: items, error: itemsError } = await this.client
      .from('order_items')
      .select(
        'id, order_id, product_id, product_name, product_image_url, selected_size, selected_color, quantity, unit_price, total_price, created_at',
      )
      .eq('order_id', id)
      .order('created_at');
    throwOnError(itemsError, 'order items');
    return { ...withProfile, items: items ?? [], shippingAddress: order.shipping_address };
  }

  private async hydrateProducts(rows: ProductRow[]): Promise<AdminProduct[]> {
    if (rows.length === 0) return [];
    const productIds = rows.map((row) => row.id);
    const categoryIds = Array.from(
      new Set(rows.flatMap((row) => (row.category_id ? [row.category_id] : []))),
    );
    const [categoriesResult, imagesResult, variantsResult] = await Promise.all([
      categoryIds.length
        ? this.client.from('categories').select('id, name, slug').in('id', categoryIds)
        : Promise.resolve({ data: [], error: null }),
      this.client
        .from('product_images')
        .select('id, product_id, image_url, alt_text, sort_order, created_at')
        .in('product_id', productIds)
        .order('sort_order'),
      this.client
        .from('product_variants')
        .select('id, product_id, color_name, color_hex, size, stock, sku, created_at')
        .in('product_id', productIds)
        .order('sku'),
    ]);
    throwOnError(categoriesResult.error, 'product categories');
    throwOnError(imagesResult.error, 'product images');
    throwOnError(variantsResult.error, 'product variants');

    const categories = new Map(
      (categoriesResult.data ?? []).map((category) => [category.id, category]),
    );
    const images = new Map<string, NonNullable<typeof imagesResult.data>>();
    for (const image of imagesResult.data ?? []) {
      images.set(image.product_id, [...(images.get(image.product_id) ?? []), image]);
    }
    const variants = new Map<string, NonNullable<typeof variantsResult.data>>();
    for (const variant of variantsResult.data ?? []) {
      variants.set(variant.product_id, [...(variants.get(variant.product_id) ?? []), variant]);
    }

    return rows.map((product) => ({
      ...product,
      category: product.category_id ? (categories.get(product.category_id) ?? null) : null,
      images: images.get(product.id) ?? [],
      variants: variants.get(product.id) ?? [],
    }));
  }

  private async withProfileNames(rows: OrderRow[]): Promise<AdminOrder[]> {
    if (rows.length === 0) return [];
    const userIds = Array.from(new Set(rows.map((row) => row.user_id)));
    const { data: profiles, error } = await this.client
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);
    throwOnError(error, 'order customers');
    const names = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name]));
    return rows.map((order) => ({
      ...order,
      status: asOrderStatus(order.status),
      profileName: names.get(order.user_id) ?? null,
    }));
  }
}
