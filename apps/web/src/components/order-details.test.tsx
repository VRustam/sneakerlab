import { render, screen } from '@testing-library/react';
import { OrderDetails } from '@/components/order-details';

describe('OrderDetails', () => {
  it('presents snapshot items, status, shipping address, and totals', () => {
    render(
      <OrderDetails
        order={{
          id: 'order',
          orderNumber: 'SL-20260714-ABCDEFGH',
          subtotal: 110,
          shippingCost: 0,
          total: 110,
          status: 'pending',
          customerName: 'Ada Customer',
          customerEmail: 'ada@example.test',
          shippingAddress: {
            addressLine1: '1 Demo Street',
            city: 'Portland',
            region: 'Oregon',
            postalCode: '97201',
            country: 'United States',
          },
          createdAt: '2026-07-14T00:00:00.000Z',
          items: [
            {
              id: 'item',
              productName: 'Atlas Court',
              productImageUrl: null,
              selectedSize: '8',
              selectedColor: 'Cloud',
              quantity: 1,
              unitPrice: 110,
              totalPrice: 110,
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('Order SL-20260714-ABCDEFGH')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Atlas Court')).toBeInTheDocument();
    expect(screen.getAllByText('$110.00')).toHaveLength(3);
    expect(screen.getByText('Delivery').parentElement).toHaveTextContent('1 Demo Street');
  });
});
