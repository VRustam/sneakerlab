import { randomUUID } from 'node:crypto';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CheckoutForm } from '@/components/checkout-form';
import { PageContainer } from '@/components/page-container';
import { EmptyState, ErrorState } from '@/components/states';
import { buttonVariants } from '@/components/ui/button';
import { getCommerceSession } from '@/lib/commerce/commerce-server';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Demo checkout',
  description: 'Complete a secure SneakerLab demo order.',
};

export default async function CheckoutPage() {
  const { repository, user } = await getCommerceSession();
  if (!user) redirect('/login?next=%2Fcheckout');
  if (!repository) {
    return (
      <PageContainer className="py-12">
        <ErrorState title="Checkout connection is not configured" />
      </PageContainer>
    );
  }

  let checkoutData: Awaited<ReturnType<typeof getCheckoutData>> | null = null;
  try {
    checkoutData = await getCheckoutData(repository, user.id);
  } catch (error) {
    console.error('Checkout failed to load', error);
  }

  if (!checkoutData) {
    return (
      <PageContainer className="py-12">
        <ErrorState
          description="We could not prepare checkout. Your cart has not been changed."
          title="Checkout temporarily unavailable"
        />
      </PageContainer>
    );
  }

  const { cart, profile } = checkoutData;
  if (cart.lines.length === 0) {
    return (
      <PageContainer className="py-12">
        <EmptyState
          action={
            <Link className={cn(buttonVariants())} href="/products">
              Browse products
            </Link>
          }
          description="Add an available product before demo checkout."
          title="Your cart is empty"
        />
      </PageContainer>
    );
  }
  if (cart.hasUnavailableLine) {
    return (
      <PageContainer className="py-12">
        <ErrorState
          description="Review unavailable items and quantities before trying demo checkout."
          title="Your cart needs an update"
        />
      </PageContainer>
    );
  }
  return (
    <PageContainer className="py-10 sm:py-14">
      <CheckoutForm
        defaultValues={{ customerName: profile.fullName ?? '', customerEmail: user.email ?? '' }}
        idempotencyKey={randomUUID()}
        itemCount={cart.itemCount}
        subtotal={cart.subtotal}
      />
    </PageContainer>
  );
}

async function getCheckoutData(
  repository: NonNullable<Awaited<ReturnType<typeof getCommerceSession>>['repository']>,
  userId: string,
) {
  const [cart, profile] = await Promise.all([
    repository.getCart(userId),
    repository.getProfile(userId),
  ]);
  return { cart, profile };
}
