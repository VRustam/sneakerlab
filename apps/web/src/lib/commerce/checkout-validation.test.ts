import { getCheckoutInput } from '@/lib/commerce/checkout-validation';

function makeCheckoutFormData(overrides: Record<string, string> = {}) {
  const values = {
    customerName: 'Ada Customer',
    customerEmail: 'ada@example.test',
    addressLine1: '1 Demo Street',
    addressLine2: '',
    city: 'Portland',
    region: 'Oregon',
    postalCode: '97201',
    country: 'United States',
    idempotencyKey: '50000000-0000-4000-8000-000000000001',
    ...overrides,
  };
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

describe('checkout validation', () => {
  it('accepts complete checkout details with a duplicate-submission key', () => {
    const parsed = getCheckoutInput(makeCheckoutFormData());
    expect(parsed.success).toBe(true);
    if (parsed.success)
      expect(parsed.data.idempotencyKey).toBe('50000000-0000-4000-8000-000000000001');
  });

  it('rejects an incomplete address and malformed checkout key', () => {
    const parsed = getCheckoutInput(
      makeCheckoutFormData({ city: '', idempotencyKey: 'not-a-uuid' }),
    );
    expect(parsed.success).toBe(false);
  });
});
