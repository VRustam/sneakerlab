import { getVariantSelectionState } from '@/lib/catalog/variant-selection';

const variants = [
  { id: 'cloud-8', color_name: 'Cloud', color_hex: '#eee', size: '8', stock: 6, sku: 'C-8' },
  { id: 'cloud-9', color_name: 'Cloud', color_hex: '#eee', size: '9', stock: 0, sku: 'C-9' },
  { id: 'ink-9', color_name: 'Ink', color_hex: '#111', size: '9', stock: 4, sku: 'I-9' },
] as const;

describe('variant combination selection', () => {
  it('defaults to an in-stock combination', () => {
    expect(getVariantSelectionState([...variants], null, null)).toMatchObject({
      color: 'Cloud',
      size: '8',
      selectedVariant: { id: 'cloud-8' },
      availableSizes: ['8', '9'],
    });
  });

  it('does not allow an impossible color and size combination', () => {
    const selection = getVariantSelectionState([...variants], 'Ink', '8');
    expect(selection.color).toBe('Ink');
    expect(selection.size).toBe('9');
    expect(selection.selectedVariant?.id).toBe('ink-9');
  });

  it('returns no selected variant for an out-of-stock size', () => {
    const selection = getVariantSelectionState([...variants], 'Cloud', '9');
    expect(selection.selectedVariant).toBeNull();
  });

  it('defaults to a purchasable color when an earlier color is entirely sold out', () => {
    const selection = getVariantSelectionState(
      [
        { id: 'sold-out', color_name: 'Stone', color_hex: '#aaa', size: '8', stock: 0, sku: 'S-8' },
        { id: 'available', color_name: 'Ink', color_hex: '#111', size: '9', stock: 2, sku: 'I-9' },
      ],
      null,
      null,
    );

    expect(selection).toMatchObject({
      color: 'Ink',
      size: '9',
      selectedVariant: { id: 'available' },
    });
  });
});
