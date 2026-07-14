import type { CatalogFilters } from '@/lib/catalog/types';

export interface CatalogQueryPlan {
  activeOnly: true;
  query?: string;
  categorySlug?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: true;
  order: { column: 'created_at' | 'price'; ascending: boolean };
  offset: number;
  limit: number;
}

export function buildCatalogQueryPlan(filters: CatalogFilters): CatalogQueryPlan {
  const order =
    filters.sort === 'price_asc'
      ? { column: 'price' as const, ascending: true }
      : filters.sort === 'price_desc'
        ? { column: 'price' as const, ascending: false }
        : { column: 'created_at' as const, ascending: false };

  return {
    activeOnly: true,
    ...(filters.query ? { query: filters.query } : {}),
    ...(filters.category ? { categorySlug: filters.category } : {}),
    ...(filters.size ? { size: filters.size } : {}),
    ...(filters.color ? { color: filters.color } : {}),
    ...(filters.minPrice !== undefined ? { minPrice: filters.minPrice } : {}),
    ...(filters.maxPrice !== undefined ? { maxPrice: filters.maxPrice } : {}),
    ...(filters.featured ? { featured: true as const } : {}),
    order,
    offset: (filters.page - 1) * filters.pageSize,
    limit: filters.pageSize,
  };
}
