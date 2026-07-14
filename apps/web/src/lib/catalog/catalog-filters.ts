import { catalogSortValues, type CatalogFilters, type CatalogSort } from '@/lib/catalog/types';

export type CatalogSearchParams = Record<string, string | string[] | undefined>;

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  query: '',
  category: '',
  size: '',
  color: '',
  minPrice: undefined,
  maxPrice: undefined,
  featured: false,
  sort: 'newest',
  page: 1,
  pageSize: 12,
};

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function cleanText(value: string | undefined, maxLength = 64) {
  return value?.trim().slice(0, maxLength) ?? '';
}

function parsePrice(value: string | undefined) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100_000 ? parsed : undefined;
}

function parsePage(value: string | undefined) {
  if (!value) return 1;
  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

function isCatalogSort(value: string): value is CatalogSort {
  return (catalogSortValues as readonly string[]).includes(value);
}

export function parseCatalogFilters(
  searchParams: CatalogSearchParams,
  overrides: Partial<CatalogFilters> = {},
): CatalogFilters {
  const minPrice = parsePrice(getSingleValue(searchParams.min));
  const parsedMaxPrice = parsePrice(getSingleValue(searchParams.max));
  const maxPrice =
    minPrice !== undefined && parsedMaxPrice !== undefined && parsedMaxPrice < minPrice
      ? undefined
      : parsedMaxPrice;
  const rawSort = cleanText(getSingleValue(searchParams.sort));

  return {
    ...DEFAULT_CATALOG_FILTERS,
    query: cleanText(getSingleValue(searchParams.q), 80),
    category: cleanText(getSingleValue(searchParams.category)),
    size: cleanText(getSingleValue(searchParams.size), 16),
    color: cleanText(getSingleValue(searchParams.color)),
    minPrice,
    maxPrice,
    featured: getSingleValue(searchParams.featured) === '1',
    sort: isCatalogSort(rawSort) ? rawSort : DEFAULT_CATALOG_FILTERS.sort,
    page: parsePage(getSingleValue(searchParams.page)),
    ...overrides,
  };
}

export function serializeCatalogFilters(filters: CatalogFilters) {
  const params = new URLSearchParams();

  if (filters.query) params.set('q', filters.query);
  if (filters.category) params.set('category', filters.category);
  if (filters.size) params.set('size', filters.size);
  if (filters.color) params.set('color', filters.color);
  if (filters.minPrice !== undefined) params.set('min', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set('max', String(filters.maxPrice));
  if (filters.featured) params.set('featured', '1');
  if (filters.sort !== DEFAULT_CATALOG_FILTERS.sort) params.set('sort', filters.sort);
  if (filters.page > 1) params.set('page', String(filters.page));

  return params;
}

export function getCatalogHref(filters: CatalogFilters, pathname = '/products') {
  const query = serializeCatalogFilters(filters).toString();
  return query ? `${pathname}?${query}` : pathname;
}
