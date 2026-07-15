import {
  buildMediaPath,
  canTransitionOrderStatus,
  parseProductForm,
  safeMediaFilename,
  slugify,
  validateMediaFile,
} from '@/lib/admin/validation';

function validProductForm() {
  const form = new FormData();
  form.set('name', 'Velocity Court');
  form.set('slug', 'velocity-court');
  form.set('price', '129.99');
  form.set('compareAtPrice', '');
  form.set('stock', '8');
  form.set('variants', '[]');
  form.set('isActive', 'on');
  return form;
}

describe('admin product validation', () => {
  it('normalizes predictable slugs and accepts an empty compare-at price', () => {
    const parsed = parseProductForm(validProductForm());
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.slug).toBe('velocity-court');
      expect(parsed.data.compareAtPrice).toBeNull();
    }
    expect(slugify('  Vélo City // Court  ')).toBe('velo-city-court');
  });

  it('rejects negative price and stock values', () => {
    const priceForm = validProductForm();
    priceForm.set('price', '-1');
    expect(parseProductForm(priceForm)).toMatchObject({
      success: false,
      error: 'Price cannot be negative.',
    });

    const stockForm = validProductForm();
    stockForm.set('stock', '-1');
    expect(parseProductForm(stockForm)).toMatchObject({
      success: false,
      error: 'Stock cannot be negative.',
    });
  });

  it('rejects duplicate variant combinations and SKUs', () => {
    const form = validProductForm();
    form.set(
      'variants',
      JSON.stringify([
        { colorName: 'Cloud', colorHex: '#EEEEEE', size: '9', stock: 3, sku: 'CLOUD-9' },
        { colorName: 'cloud', colorHex: '#EEEEEE', size: '9', stock: 4, sku: 'CLOUD-9' },
      ]),
    );
    expect(parseProductForm(form)).toMatchObject({
      success: false,
      error: 'Each color and size combination must be unique.',
    });
  });
});

describe('admin order and media validation', () => {
  it('enforces the allowed order state graph', () => {
    expect(canTransitionOrderStatus('pending', 'processing')).toBe(true);
    expect(canTransitionOrderStatus('processing', 'cancelled')).toBe(true);
    expect(canTransitionOrderStatus('shipped', 'delivered')).toBe(true);
    expect(canTransitionOrderStatus('pending', 'delivered')).toBe(false);
    expect(canTransitionOrderStatus('delivered', 'processing')).toBe(false);
  });

  it('rejects unsupported and oversized uploads while generating safe paths', () => {
    expect(
      validateMediaFile(
        { name: 'payload.exe', type: 'application/x-msdownload', size: 42 } as File,
        'image',
      ),
    ).toMatchObject({
      success: false,
      error: 'Choose a JPEG, PNG, or WebP image.',
    });
    expect(
      validateMediaFile(
        { name: 'pair.glb', type: 'model/gltf-binary', size: 21 * 1024 * 1024 } as File,
        'model',
      ),
    ).toMatchObject({
      success: false,
      error: 'Models must be 20 MB or smaller.',
    });
    expect(safeMediaFilename('My Sneaker (final).WEBP')).toBe('my-sneaker-final.webp');
    expect(
      buildMediaPath(
        '20000000-0000-0000-0000-000000000001',
        'image',
        'My Sneaker.webp',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      ),
    ).toBe(
      'products/20000000-0000-0000-0000-000000000001/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa-my-sneaker.webp',
    );
  });
});
