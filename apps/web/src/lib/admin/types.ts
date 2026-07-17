import type { AdminOrderStatus } from '@/lib/admin/validation';
import type { Database, Json } from '@/lib/supabase/database.types';

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductImageRow = Database['public']['Tables']['product_images']['Row'];
type ProductVariantRow = Database['public']['Tables']['product_variants']['Row'];
type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];

export type AdminCategory = CategoryRow & { productCount: number };
export type AdminProduct = ProductRow & {
  category: Pick<CategoryRow, 'id' | 'name' | 'slug'> | null;
  images: ProductImageRow[];
  variants: ProductVariantRow[];
};

export type AdminOrder = Omit<OrderRow, 'status'> & {
  status: AdminOrderStatus;
  profileName: string | null;
};

export type AdminOrderDetail = AdminOrder & {
  items: OrderItemRow[];
  shippingAddress: Json;
};

export interface AdminDashboard {
  activeProductCount: number;
  lowStockCount: number;
  totalOrderCount: number;
  pendingOrProcessingCount: number;
  grossOrderValue: number;
  recentOrders: AdminOrder[];
}

export interface AdminPage<T> {
  rows: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
}

export interface AdminAnalytics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalProductsSold: number;
  revenueByDay: { date: string; revenue: number; orders: number }[];
  revenueByCategory: { name: string; value: number; count: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
}
