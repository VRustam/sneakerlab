import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { OrderDetails } from '@/components/order-details';
import { ErrorState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { getCommerceSession } from '@/lib/commerce/commerce-server';

interface OrderPageProps {
  params: Promise<{ orderNumber: string }>;
}

export const metadata: Metadata = { title: 'Order details' };

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderNumber } = await params;
  const { repository, user } = await getCommerceSession();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/orders/${orderNumber}`)}`);
  if (!repository)
    return (
      <PageContainer className="py-12">
        <ErrorState title="Order connection is not configured" />
      </PageContainer>
    );

  let order = null;
  let didLoadFail = false;
  try {
    order = await repository.getOrderByNumber(user.id, orderNumber);
  } catch (error) {
    console.error('Order failed to load', error);
    didLoadFail = true;
  }

  if (!order) {
    if (!didLoadFail) notFound();
    return (
      <PageContainer className="py-12">
        <ErrorState title="Order temporarily unavailable" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-10 sm:py-14">
      <OrderDetails order={order} />
    </PageContainer>
  );
}
