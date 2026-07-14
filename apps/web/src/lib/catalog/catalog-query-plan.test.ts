import { DEFAULT_CATALOG_FILTERS } from '@/lib/catalog/catalog-filters';
import { buildCatalogQueryPlan } from '@/lib/catalog/catalog-query-plan';

describe('catalog query plan', () => {
  it('always scopes public catalog reads to active products', () => {
    expect(buildCatalogQueryPlan(DEFAULT_CATALOG_FILTERS)).toMatchObject({
      activeOnly: true,
      order: { column: 'created_at', ascending: false },
      offset: 0,
      limit: 12,
    });
  });

  it('maps search, variant filters, price, featured state, sorting, and pagination explicitly', () => {
    const plan = buildCatalogQueryPlan({
      ...DEFAULT_CATALOG_FILTERS,
      query: 'trail',
      category: 'trail',
      size: '10',
      color: 'Moss',
      minPrice: 100,
      maxPrice: 200,
      featured: true,
      sort: 'price_desc',
      page: 2,
    });

    expect(plan).toEqual({
      activeOnly: true,
      query: 'trail',
      categorySlug: 'trail',
      size: '10',
      color: 'Moss',
      minPrice: 100,
      maxPrice: 200,
      featured: true,
      order: { column: 'price', ascending: false },
      offset: 12,
      limit: 12,
    });
  });
});
