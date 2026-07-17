'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCheckoutInput } from '@/lib/commerce/checkout-validation';
import { CommerceDataError } from '@/lib/commerce/commerce-repository';
import { getCommerceSession } from '@/lib/commerce/commerce-server';

export interface CheckoutActionResult {
  error?: string;
}

function getCheckoutError(error: unknown) {
  if (error instanceof CommerceDataError) {
    if (error.code === 'empty') return 'Your cart is empty.';
    if (error.code === 'stock') return 'Stock changed before checkout. Please update your cart.';
    if (error.code === 'unavailable') return 'A product in your cart is no longer available.';
  }
  return 'We could not complete demo checkout. Your cart is still available to review.';
}

export async function checkoutAction(formData: FormData): Promise<CheckoutActionResult> {
  const parsed = getCheckoutInput(formData);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? 'Check the checkout form.' };

  const { repository, user } = await getCommerceSession();
  if (!repository || !user) redirect('/login?next=%2Fcheckout');

  try {
    const order = await repository.placeOrder(user.id, {
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      shippingAddress: {
        addressLine1: parsed.data.addressLine1,
        addressLine2: parsed.data.addressLine2,
        city: parsed.data.city,
        region: parsed.data.region,
        postalCode: parsed.data.postalCode,
        country: parsed.data.country,
      },
      idempotencyKey: parsed.data.idempotencyKey,
      couponCode: parsed.data.couponCode,
    });
    revalidatePath('/cart');
    revalidatePath('/orders');
    redirect(`/checkout/success?order=${encodeURIComponent(order.orderNumber)}`);
  } catch (error) {
    return { error: getCheckoutError(error) };
  }
}
