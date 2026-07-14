import type { SupabaseClient } from '@supabase/supabase-js';
import { buildCatalogQueryPlan } from '@/lib/catalog/catalog-query-plan';
import {
  DEFAULT_CATALOG_FILTERS,
  type CatalogSearchParams,
  parseCatalogFilters,
} from '@/lib/catalog/catalog-filters';
import type {
  CatalogCategory,
  CatalogFacets,
  CatalogFilters,
  CatalogImage,
  CatalogPage,
  CatalogProduct,
  CatalogVariant,
  ProductDetail,
} from '@/lib/catalog/types';
import type { Database } from '@/lib/supabase/database.types';

type CatalogClient = SupabaseClient<Database>;
type ProductRow = Database['public']['Tables']['products']['Row'];

export class CatalogDataError extends Error {
  constructor(context: string) {
    super(`Catalog data could not be loaded: ${context}.`);
    this.name = 'CatalogDataError';
  }
}

function throwOnError(error: { message: string } | null, context: string) {
  if (error) throw new CatalogDataError(context);
}

function escapeSearchTerm(value: string) {
  return value.replace(/[%,()]/g, ' ').trim();
}

export class SupabaseCatalogRepository {
  constructor(private readonly client: CatalogClient) {}

  async list(filters: CatalogFilters): Promise<CatalogPage> {
    const [facets, categoryId, variantProductIds] = await Promise.all([
      this.getFacets(),
      filters.category ? this.getCategoryId(filters.category) : Promise.resolve(undefined),
      this.getVariantProductIds(filters),
    ]);

    if (
      (filters.category && !categoryId) ||
      (variantProductIds && variantProductIds.length === 0)
    ) {
      return { products: [], totalCount: 0, hasNextPage: false, facets };
    }

    const plan = buildCatalogQueryPlan(filters);
    let query = this.client
      .from('products')
      .select(
        'id, category_id, name, slug, short_description, description, price, compare_at_price, image_url, model_3d_url, stock, is_featured, is_active, created_at, updated_at',
        { count: 'exact' },
      )
      .eq('is_active', true);

    if (categoryId) query = query.eq('category_id', categoryId);
    if (variantProductIds) query = query.in('id', variantProductIds);
    if (plan.query) {
      const searchTerm = escapeSearchTerm(plan.query);
      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`,
        );
      }
    }
    if (plan.minPrice !== undefined) query = query.gte('price', plan.minPrice);
    if (plan.maxPrice !== undefined) query = query.lte('price', plan.maxPrice);
    if (plan.featured) query = query.eq('is_featured', true);

    const { data, error, count } = await query
      .order(plan.order.column, { ascending: plan.order.ascending })
      .range(plan.offset, plan.offset + plan.limit - 1);
    throwOnError(error, 'products');

    const products = await this.hydrateProducts(data ?? []);
    const totalCount = count ?? 0;
    return {
      products,
      totalCount,
      hasNextPage: plan.offset + products.length < totalCount,
      facets,
    };
  }

  async getFeaturedProducts(limit = 4) {
    const page = await this.list({
      ...DEFAULT_CATALOG_FILTERS,
      featured: true,
      pageSize: limit,
    });
    return page.products;
  }

  async getProductDetail(slug: string): Promise<ProductDetail | null> {
    const { data, error } = await this.client
      .from('products')
      .select(
        'id, category_id, name, slug, short_description, description, price, compare_at_price, image_url, model_3d_url, stock, is_featured, is_active, created_at, updated_at',
      )
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();
    throwOnError(error, 'product detail');
    if (!data) return null;

    const [product] = await this.hydrateProducts([data]);
    if (!product) return null;

    if (!product.category) return { product, relatedProducts: [] };
    const { data: relatedRows, error: relatedError } = await this.client
      .from('products')
      .select(
        'id, category_id, name, slug, short_description, description, price, compare_at_price, image_url, model_3d_url, stock, is_featured, is_active, created_at, updated_at',
      )
      .eq('category_id', product.category.id)
      .eq('is_active', true)
      .neq('id', product.id)
      .order('created_at', { ascending: false })
      .limit(4);
    throwOnError(relatedError, 'related products');

    return { product, relatedProducts: await this.hydrateProducts(relatedRows ?? []) };
  }

  async getFavoriteProductIds(userId: string) {
    const { data, error } = await this.client
      .from('favorites')
      .select('product_id')
      .eq('user_id', userId);
    throwOnError(error, 'favorites');
    return new Set((data ?? []).map((favorite) => favorite.product_id));
  }

  async getFavoriteProducts(userId: string) {
    const { data, error } = await this.client
      .from('favorites')
      .select('product_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    throwOnError(error, 'favorites');

    const productIds = (data ?? []).map((favorite) => favorite.product_id);
    if (productIds.length === 0) return [];

    const { data: products, error: productsError } = await this.client
      .from('products')
      .select(
        'id, category_id, name, slug, short_description, description, price, compare_at_price, image_url, model_3d_url, stock, is_featured, is_active, created_at, updated_at',
      )
      .eq('is_active', true)
      .in('id', productIds);
    throwOnError(productsError, 'favorite products');

    const hydrated = await this.hydrateProducts(products ?? []);
    const position = new Map(productIds.map((id, index) => [id, index]));
    return hydrated.sort(
      (left, right) => (position.get(left.id) ?? 0) - (position.get(right.id) ?? 0),
    );
  }

  async toggleFavorite(userId: string, productId: string, isFavorite: boolean) {
    if (isFavorite) {
      const { error } = await this.client
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
      throwOnError(error, 'removing favorite');
      return false;
    }

    const { error } = await this.client
      .from('favorites')
      .insert({ user_id: userId, product_id: productId });
    throwOnError(error, 'adding favorite');
    return true;
  }

  async getCategories() {
    const { data, error } = await this.client
      .from('categories')
      .select('id, name, slug, description, image_url')
      .eq('is_active', true)
      .order('name', { ascending: true });
    throwOnError(error, 'categories');
    return data ?? [];
  }

  private async getCategoryId(slug: string) {
    const { data, error } = await this.client
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();
    throwOnError(error, 'category filter');
    return data?.id;
  }

  private async getVariantProductIds(filters: CatalogFilters) {
    if (!filters.size && !filters.color) return undefined;

    let query = this.client.from('product_variants').select('product_id');
    if (filters.size) query = query.eq('size', filters.size);
    if (filters.color) query = query.eq('color_name', filters.color);

    const { data, error } = await query;
    throwOnError(error, 'variant filters');
    return Array.from(new Set((data ?? []).map((variant) => variant.product_id)));
  }

  private async getFacets(): Promise<CatalogFacets> {
    const [categories, activeProducts] = await Promise.all([
      this.getCategories(),
      this.client.from('products').select('id').eq('is_active', true),
    ]);
    throwOnError(activeProducts.error, 'catalog facets');

    const activeProductIds = (activeProducts.data ?? []).map((product) => product.id);
    if (activeProductIds.length === 0) return { categories, sizes: [], colors: [] };

    const { data: variants, error } = await this.client
      .from('product_variants')
      .select('size, color_name')
      .in('product_id', activeProductIds);
    throwOnError(error, 'catalog facets');

    return {
      categories,
      sizes: Array.from(new Set((variants ?? []).map((variant) => variant.size))).sort(
        (left, right) => Number(left) - Number(right),
      ),
      colors: Array.from(new Set((variants ?? []).map((variant) => variant.color_name))).sort(),
    };
  }

  private async hydrateProducts(rows: ProductRow[]): Promise<CatalogProduct[]> {
    if (rows.length === 0) return [];

    const productIds = rows.map((product) => product.id);
    const categoryIds = Array.from(
      new Set(rows.flatMap((product) => (product.category_id ? [product.category_id] : []))),
    );
    const [imagesResult, variantsResult, categoriesResult] = await Promise.all([
      this.client
        .from('product_images')
        .select('id, product_id, image_url, alt_text, sort_order')
        .in('product_id', productIds)
        .order('sort_order', { ascending: true }),
      this.client
        .from('product_variants')
        .select('id, product_id, color_name, color_hex, size, stock, sku')
        .in('product_id', productIds),
      categoryIds.length > 0
        ? this.client
            .from('categories')
            .select('id, name, slug, description, image_url')
            .in('id', categoryIds)
        : Promise.resolve({ data: [] as CatalogCategory[], error: null }),
    ]);
    throwOnError(imagesResult.error, 'product images');
    throwOnError(variantsResult.error, 'product variants');
    throwOnError(categoriesResult.error, 'product categories');

    const imagesByProduct = new Map<string, CatalogImage[]>();
    for (const image of imagesResult.data ?? []) {
      const images = imagesByProduct.get(image.product_id) ?? [];
      images.push(image);
      imagesByProduct.set(image.product_id, images);
    }

    const variantsByProduct = new Map<string, CatalogVariant[]>();
    for (const variant of variantsResult.data ?? []) {
      const variants = variantsByProduct.get(variant.product_id) ?? [];
      variants.push(variant);
      variantsByProduct.set(variant.product_id, variants);
    }

    const categoriesById = new Map(
      (categoriesResult.data ?? []).map((category) => [category.id, category]),
    );
    return rows.map((product) => ({
      ...product,
      category: product.category_id ? (categoriesById.get(product.category_id) ?? null) : null,
      images: imagesByProduct.get(product.id) ?? [],
      variants: variantsByProduct.get(product.id) ?? [],
    }));
  }
}

export function getCatalogFiltersForCategory(searchParams: CatalogSearchParams, category: string) {
  return parseCatalogFilters(searchParams, { category, page: 1 });
}
