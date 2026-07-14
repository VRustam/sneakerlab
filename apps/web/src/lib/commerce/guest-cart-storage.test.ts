import { parseGuestCart, serializeGuestCart } from '@/lib/commerce/guest-cart-storage';

const guestLine = {
  key: '20000000-0000-0000-0000-000000000001:40000000-0000-0000-0000-000000000001',
  productId: '20000000-0000-0000-0000-000000000001',
  variantId: '40000000-0000-0000-0000-000000000001',
  productName: 'Atlas Court',
  imageUrl: null,
  price: 110,
  colorName: 'Cloud',
  size: '8',
  availableStock: 4,
  quantity: 1,
};

describe('guest cart serialization', () => {
  it('round-trips valid local cart data', () => {
    expect(parseGuestCart(serializeGuestCart([guestLine]))).toEqual([guestLine]);
  });

  it('discards malformed browser storage safely', () => {
    expect(parseGuestCart('{broken')).toEqual([]);
    expect(parseGuestCart(JSON.stringify([{ ...guestLine, quantity: -1 }]))).toEqual([]);
  });
});
