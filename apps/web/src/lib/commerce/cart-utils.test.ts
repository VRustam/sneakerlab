import {
  addGuestCartLine,
  clampCartQuantity,
  getCartLineKey,
  getCartSummary,
  updateGuestCartLine,
} from '@/lib/commerce/cart-utils';
import type { CartLine, GuestCartPayload } from '@/lib/commerce/types';

const guestPayload: GuestCartPayload = {
  productId: '20000000-0000-0000-0000-000000000001',
  variantId: '40000000-0000-0000-0000-000000000001',
  productName: 'Atlas Court',
  imageUrl: null,
  price: 110,
  colorName: 'Cloud',
  size: '8',
  availableStock: 2,
};

describe('cart line utilities', () => {
  it('creates a stable line identity and caps guest quantities at stock', () => {
    const key = getCartLineKey(guestPayload.productId, guestPayload.variantId);
    let lines = addGuestCartLine([], guestPayload);
    lines = addGuestCartLine(lines, guestPayload);
    lines = addGuestCartLine(lines, guestPayload);

    expect(key).toBe(`${guestPayload.productId}:${guestPayload.variantId}`);
    expect(lines).toHaveLength(1);
    expect(lines[0]?.quantity).toBe(2);
    expect(clampCartQuantity(4, 2)).toBe(2);
  });

  it('decrements or removes a guest line without retaining invalid quantities', () => {
    const lines = addGuestCartLine([], guestPayload);
    expect(updateGuestCartLine(lines, lines[0]!.key, 0)).toEqual([]);
  });

  it('calculates display totals and marks unavailable persistent lines', () => {
    const lines: CartLine[] = [
      {
        id: 'line',
        productId: guestPayload.productId,
        variantId: guestPayload.variantId,
        quantity: 2,
        product: {
          id: guestPayload.productId,
          name: 'Atlas Court',
          imageUrl: null,
          price: 110,
          stock: 2,
          isActive: true,
        },
        variant: { id: guestPayload.variantId!, colorName: 'Cloud', size: '8', stock: 1 },
        availableStock: 1,
        isAvailable: true,
      },
    ];

    expect(getCartSummary(lines)).toMatchObject({
      itemCount: 2,
      subtotal: 220,
      hasUnavailableLine: true,
    });
  });
});
