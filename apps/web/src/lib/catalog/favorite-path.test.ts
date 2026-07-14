import { getSafeFavoriteReturnPath } from '@/lib/catalog/favorite-path';

describe('favorite return path safety', () => {
  it('keeps safe in-app paths and rejects external redirect targets', () => {
    expect(getSafeFavoriteReturnPath('/products/atlas-court')).toBe('/products/atlas-court');
    expect(getSafeFavoriteReturnPath('https://example.com')).toBe('/products');
    expect(getSafeFavoriteReturnPath('//example.com')).toBe('/products');
  });
});
