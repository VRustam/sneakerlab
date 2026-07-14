import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { EmptyState, ErrorState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { buttonVariants } from '@/components/ui/button';
import { formatPrice } from '@/lib/catalog/catalog-format';
import { getCommerceSession } from '@/lib/commerce/commerce-server';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Orders',
  description: 'Your SneakerLab demo order history.',
};

export default async function OrdersPage() {
  const { repository, user } = await getCommerceSession();
  if (!user) redirect('/login?next=%2Forders');
  if (!repository)
    return (
      <PageContainer className="py-12">
        <ErrorState title="Order connection is not configured" />
      </PageContainer>
    );

  let orders = null;
  try {
    orders = await repository.getOrders(user.id);
  } catch (error) {
    console.error('Orders failed to load', error);
  }

  if (!orders) {
    return (
      <PageContainer className="py-12">
        <ErrorState title="Orders temporarily unavailable" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8 py-10 sm:py-14">
      <PageHeader
        eyebrow="Order history"
        title="Your demo orders"
        description="Orders are priced and created by the database, not the browser."
      />
      {orders.length === 0 ? (
        <EmptyState
          action={
            <Link className={cn(buttonVariants())} href="/products">
              Browse products
            </Link>
          }
          description="Complete demo checkout to see a secure order snapshot here."
          title="No orders yet"
        />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {orders.map((order) => (
            <li className="flex flex-wrap items-center justify-between gap-4 p-5" key={order.id}>
              <div>
                <Link className="font-bold hover:underline" href={`/orders/${order.orderNumber}`}>
                  {order.orderNumber}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
                    new Date(order.createdAt),
                  )}{' '}
                  · {order.status}
                </p>
              </div>
              <p className="font-semibold">{formatPrice(order.total)}</p>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
