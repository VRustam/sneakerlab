import { vi } from 'vitest';

const { getAdminContext } = vi.hoisted(() => ({ getAdminContext: vi.fn() }));
vi.mock('@/lib/admin/server', () => ({ getAdminContext }));

import { saveProductAction, updateOrderStatusAction } from '@/app/actions/admin';

describe('admin server actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdminContext.mockResolvedValue(null);
  });

  it('does not allow an unauthenticated or customer caller to mutate products', async () => {
    const form = new FormData();
    form.set('name', 'Forbidden product');
    form.set('slug', 'forbidden-product');
    form.set('price', '10');
    form.set('stock', '1');
    form.set('variants', '[]');
    await expect(saveProductAction(form)).resolves.toEqual({
      error: 'This action requires an authenticated admin account.',
    });
  });

  it('does not allow a caller without an admin context to mutate order status', async () => {
    const form = new FormData();
    form.set('orderId', '50000000-0000-0000-0000-000000000001');
    form.set('status', 'processing');
    await expect(updateOrderStatusAction(form)).resolves.toEqual({
      error: 'This action requires an authenticated admin account.',
    });
  });
});
