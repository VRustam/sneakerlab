import {
  formatPrice,
  getProductImage,
  getProductStock,
  getStockLabel,
} from '@/lib/catalog/catalog-format';

const product = {
  name: 'Atlas Court',
  stock: 0,
  image_url: 'https://placehold.co/1200x1200/png?text=Atlas+Court',
  images: [
    {
      id: 'image-1',
      image_url: 'https://placehold.co/1200x1200/png?text=Atlas+Court',
      alt_text: 'Atlas Court in studio',
      sort_order: 0,
    },
  ],
  variants: [
    { id: 'variant-1', color_name: 'Cloud', color_hex: '#ffffff', size: '8', stock: 3, sku: 'A-8' },
    { id: 'variant-2', color_name: 'Cloud', color_hex: '#ffffff', size: '9', stock: 4, sku: 'A-9' },
  ],
};

describe('catalog presentation formatting', () => {
  it('formats prices in a stable currency format', () => {
    expect(formatPrice(110)).toBe('$110.00');
  });

  it('uses variant stock when variants are present', () => {
    expect(getProductStock(product)).toBe(7);
    expect(getStockLabel(product)).toBe('In stock');
  });

  it('renders the primary image and useful alt text', () => {
    expect(getProductImage(product)).toEqual({
      src: 'https://placehold.co/1200x1200/png?text=Atlas+Court',
      alt: 'Atlas Court in studio',
    });
  });
});
