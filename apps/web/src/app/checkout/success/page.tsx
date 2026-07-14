import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { OrderDetails } from '@/components/order-details';
import { ErrorState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { buttonVariants } from '@/components/ui/button';
import { getCommerceSession } from '@/lib/commerce/commerce-server';
import { cn } from '@/lib/utils';

interface CheckoutSuccessPageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const { order: orderNumber } = await searchParams;
  const { repository, user } = await getCommerceSession();
  if (!user) redirect('/login?next=%2Forders');
  if (!orderNumber) notFound();
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
    console.error('Checkout success failed to load', error);
    didLoadFail = true;
  }

  if (!order) {
    if (!didLoadFail) notFound();
    return (
      <PageContainer className="py-12">
        <ErrorState title="Order confirmation temporarily unavailable" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6 py-10 sm:py-14">
      <Link className={cn(buttonVariants({ variant: 'outline' }))} href="/products">
        Continue browsing
      </Link>
      <OrderDetails order={order} />
    </PageContainer>
  );
}
