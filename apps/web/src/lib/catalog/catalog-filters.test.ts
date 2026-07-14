import {
  getCatalogHref,
  parseCatalogFilters,
  serializeCatalogFilters,
} from '@/lib/catalog/catalog-filters';

describe('catalog filter parsing', () => {
  it('parses valid shareable filter state', () => {
    const filters = parseCatalogFilters({
      q: '  runner ',
      category: 'running',
      size: '9',
      color: 'Navy',
      min: '99',
      max: '160',
      featured: '1',
      sort: 'price_asc',
      page: '2',
    });

    expect(filters).toMatchObject({
      query: 'runner',
      category: 'running',
      size: '9',
      color: 'Navy',
      minPrice: 99,
      maxPrice: 160,
      featured: true,
      sort: 'price_asc',
      page: 2,
    });
  });

  it('rejects invalid values and impossible price ranges', () => {
    const filters = parseCatalogFilters({
      min: '-10',
      max: 'not-a-price',
      sort: 'unknown',
      page: '0',
    });
    expect(filters.minPrice).toBeUndefined();
    expect(filters.maxPrice).toBeUndefined();
    expect(filters.sort).toBe('newest');
    expect(filters.page).toBe(1);

    expect(parseCatalogFilters({ min: '160', max: '99' }).maxPrice).toBeUndefined();
  });

  it('serializes filters without default noise and builds a reusable URL', () => {
    const filters = parseCatalogFilters({
      q: 'court',
      featured: '1',
      sort: 'price_desc',
      page: '3',
    });
    expect(serializeCatalogFilters(filters).toString()).toBe(
      'q=court&featured=1&sort=price_desc&page=3',
    );
    expect(getCatalogHref(filters)).toBe('/products?q=court&featured=1&sort=price_desc&page=3');
  });
});
