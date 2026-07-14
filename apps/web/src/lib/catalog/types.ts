import type { Database } from '@/lib/supabase/database.types';

export type CatalogCategory = Pick<
  Database['public']['Tables']['categories']['Row'],
  'id' | 'name' | 'slug' | 'description' | 'image_url'
>;

export type CatalogImage = Pick<
  Database['public']['Tables']['product_images']['Row'],
  'id' | 'image_url' | 'alt_text' | 'sort_order'
>;

export type CatalogVariant = Pick<
  Database['public']['Tables']['product_variants']['Row'],
  'id' | 'color_name' | 'color_hex' | 'size' | 'stock' | 'sku'
>;

export type CatalogProduct = Database['public']['Tables']['products']['Row'] & {
  category: CatalogCategory | null;
  images: CatalogImage[];
  variants: CatalogVariant[];
};

export const catalogSortValues = ['newest', 'price_asc', 'price_desc'] as const;
export type CatalogSort = (typeof catalogSortValues)[number];

export interface CatalogFilters {
  query: string;
  category: string;
  size: string;
  color: string;
  minPrice?: number;
  maxPrice?: number;
  featured: boolean;
  sort: CatalogSort;
  page: number;
  pageSize: number;
}

export interface CatalogFacets {
  categories: CatalogCategory[];
  sizes: string[];
  colors: string[];
}

export interface CatalogPage {
  products: CatalogProduct[];
  totalCount: number;
  hasNextPage: boolean;
  facets: CatalogFacets;
}

export interface ProductDetail {
  product: CatalogProduct;
  relatedProducts: CatalogProduct[];
}
