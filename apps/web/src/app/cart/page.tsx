import type { Metadata } from 'next';
import { CartContents } from '@/components/cart-contents';
import { ErrorState } from '@/components/states';
import { GuestCartContents } from '@/components/guest-cart-contents';
import { GuestCartMerge } from '@/components/guest-cart-merge';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { getCommerceSession } from '@/lib/commerce/commerce-server';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Review your SneakerLab cart before demo checkout.',
};

export default async function CartPage() {
  const { repository, user } = await getCommerceSession();

  if (!user) {
    return (
      <PageContainer className="space-y-8 py-10 sm:py-14">
        <PageHeader
          eyebrow="Guest cart"
          title="Your saved pairs"
          description="Guest cart items stay in this browser until you sign in. Stock and price are verified during demo checkout."
        />
        <GuestCartContents />
      </PageContainer>
    );
  }

  if (!repository) {
    return (
      <PageContainer className="py-12 sm:py-16">
        <ErrorState
          description="Add public Supabase configuration to load your persistent cart."
          title="Cart connection is not configured"
        />
      </PageContainer>
    );
  }

  let cart = null;
  try {
    cart = await repository.getCart(user.id);
  } catch (error) {
    console.error('Cart failed to load', error);
  }

  if (!cart) {
    return (
      <PageContainer className="py-12 sm:py-16">
        <ErrorState
          description="We could not load your cart. Please refresh and try again."
          title="Cart temporarily unavailable"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8 py-10 sm:py-14">
      <PageHeader
        eyebrow="Cart"
        title="Ready when you are"
        description="Quantities are checked against live inventory before demo checkout."
      />
      <GuestCartMerge />
      <CartContents cart={cart} />
    </PageContainer>
  );
}
