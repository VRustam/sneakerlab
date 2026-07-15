import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { OrderStatusForm } from '@/components/admin/order-status-form';
import { StatusBadge } from '@/components/admin/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { formatPrice } from '@/lib/catalog/catalog-format';
import { SupabaseAdminRepository } from '@/lib/admin/repository';
import { requireAdminPage } from '@/lib/admin/server';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Admin order detail' };

function addressLines(address: unknown) {
  if (!address || typeof address !== 'object' || Array.isArray(address))
    return ['No address snapshot available.'];
  const values = address as Record<string, unknown>;
  return ['addressLine1', 'addressLine2', 'city', 'region', 'postalCode', 'country']
    .map((key) => values[key])
    .filter((value): value is string => typeof value === 'string' && value.length > 0);
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const context = await requireAdminPage();
  const order = await new SupabaseAdminRepository(context.client).getOrder(id);
  if (!order) notFound();
  return (
    <div className="space-y-7">
      <AdminPageHeader
        action={
          <Link className={cn(buttonVariants({ variant: 'outline' }))} href="/admin/orders">
            Back to orders
          </Link>
        }
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Orders', href: '/admin/orders' },
          { label: order.order_number },
        ]}
        description={
          'Placed ' +
          new Date(order.created_at).toLocaleString() +
          ' · customer snapshot preserved with the order.'
        }
        title={order.order_number}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item) => (
              <div
                className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
                key={item.id}
              >
                <div>
                  <p className="font-semibold">{item.product_name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.selected_color ?? 'Standard'} · {item.selected_size ?? 'One size'} ·
                    Quantity {item.quantity}
                  </p>
                </div>
                <p className="font-mono text-sm font-bold">{formatPrice(item.total_price)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fulfilment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <StatusBadge status={order.status} />
              <OrderStatusForm currentStatus={order.status} orderId={order.id} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Customer and delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-semibold">{order.profileName ?? order.customer_name}</p>
                <p className="text-muted-foreground">{order.customer_email}</p>
              </div>
              <address className="not-italic text-muted-foreground">
                {addressLines(order.shippingAddress).map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </address>
              <div className="border-t border-border pt-3">
                <p className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </p>
                <p className="mt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
