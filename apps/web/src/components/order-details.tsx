import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/catalog/catalog-format';
import type { CustomerOrder } from '@/lib/commerce/types';

interface OrderDetailsProps {
  order: CustomerOrder;
}

const statusLabels = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
} as const;

export function OrderDetails({ order }: OrderDetailsProps) {
  const address = order.shippingAddress;
  return (
    <div className="space-y-7">
      <section className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-card p-5 sm:p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            Order {order.orderNumber}
          </p>
          <h1 className="mt-2 text-3xl font-bold">Thanks for your demo order</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Placed{' '}
            {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
              new Date(order.createdAt),
            )}
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          {statusLabels[order.status]}
        </span>
      </section>
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section
          className="overflow-hidden rounded-xl border border-border bg-card"
          aria-labelledby="order-items-title"
        >
          <h2 className="border-b border-border p-5 text-lg font-bold" id="order-items-title">
            Items
          </h2>
          <ul className="divide-y divide-border">
            {order.items.map((item) => (
              <li className="flex gap-4 p-5" key={item.id}>
                <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.productImageUrl ? (
                    <Image
                      alt={item.productName}
                      className="object-cover"
                      fill
                      sizes="80px"
                      src={item.productImageUrl}
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.productName}</p>
                  {item.selectedColor || item.selectedSize ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.selectedColor} · Size {item.selectedSize}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.quantity} × {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <p className="whitespace-nowrap font-semibold">{formatPrice(item.totalPrice)}</p>
              </li>
            ))}
          </ul>
        </section>
        <aside className="space-y-5 rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
          <div>
            <h2 className="font-bold">Delivery</h2>
            <address className="mt-2 not-italic text-sm leading-6 text-muted-foreground">
              {order.customerName}
              <br />
              {address.addressLine1}
              <br />
              {address.addressLine2 ? (
                <>
                  {address.addressLine2}
                  <br />
                </>
              ) : null}
              {address.city}, {address.region} {address.postalCode}
              <br />
              {address.country}
            </address>
          </div>
          <div className="space-y-2 border-y border-border py-4 text-sm">
            <p className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </p>
            <p className="flex justify-between">
              <span>Shipping</span>
              <span>{formatPrice(order.shippingCost)}</span>
            </p>
            <p className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </p>
          </div>
          <Link className="text-sm font-semibold text-primary hover:underline" href="/orders">
            View all orders
          </Link>
        </aside>
      </div>
    </div>
  );
}
