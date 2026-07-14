'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { CommerceDataError } from '@/lib/commerce/commerce-repository';
import { getCommerceSession } from '@/lib/commerce/commerce-server';
import { getSafeFavoriteReturnPath } from '@/lib/catalog/favorite-path';

const uuid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
const quantity = z.coerce.number().int().min(0).max(99);
const guestLineSchema = z.object({
  productId: uuid,
  variantId: uuid.nullable(),
  quantity: z.number().int().min(1).max(99),
});

export interface CartActionResult {
  error?: string;
  merged?: number;
  skipped?: number;
}

function getCartError(error: unknown) {
  if (error instanceof CommerceDataError) {
    if (error.code === 'stock') return 'That quantity is no longer available.';
    if (error.code === 'unavailable') return 'This product is no longer available.';
    if (error.code === 'not-found') return 'This cart line is no longer available.';
  }
  return 'We could not update your cart. Please try again.';
}

async function getRequiredCartSession(returnPath: string) {
  const session = await getCommerceSession();
  if (!session.repository || !session.user) {
    redirect(`/login?next=${encodeURIComponent(returnPath)}`);
  }
  return { repository: session.repository, user: session.user };
}

export async function addToCartAction(formData: FormData): Promise<CartActionResult> {
  const returnPath = getSafeFavoriteReturnPath(formData.get('returnPath'));
  const productId = uuid.safeParse(formData.get('productId'));
  const rawVariantId = formData.get('variantId');
  const variantId = rawVariantId
    ? uuid.safeParse(rawVariantId)
    : { success: true as const, data: null };
  if (!productId.success || !variantId.success)
    return { error: 'Select an available product option.' };

  const { repository, user } = await getRequiredCartSession(returnPath);
  try {
    await repository.addCartLine(user.id, productId.data, variantId.data);
    revalidatePath('/cart');
    revalidatePath(returnPath);
    return {};
  } catch (error) {
    return { error: getCartError(error) };
  }
}

export async function updateCartQuantityAction(formData: FormData): Promise<CartActionResult> {
  const cartItemId = uuid.safeParse(formData.get('cartItemId'));
  const nextQuantity = quantity.safeParse(formData.get('quantity'));
  if (!cartItemId.success || !nextQuantity.success) return { error: 'Use a valid cart quantity.' };

  const { repository, user } = await getRequiredCartSession('/cart');
  try {
    await repository.updateCartLineQuantity(user.id, cartItemId.data, nextQuantity.data);
    revalidatePath('/cart');
    return {};
  } catch (error) {
    return { error: getCartError(error) };
  }
}

export async function removeCartLineAction(formData: FormData): Promise<CartActionResult> {
  const cartItemId = uuid.safeParse(formData.get('cartItemId'));
  if (!cartItemId.success) return { error: 'This cart line is no longer available.' };

  const { repository, user } = await getRequiredCartSession('/cart');
  try {
    await repository.removeCartLine(user.id, cartItemId.data);
    revalidatePath('/cart');
    return {};
  } catch (error) {
    return { error: getCartError(error) };
  }
}

export async function mergeGuestCartAction(formData: FormData): Promise<CartActionResult> {
  const parsedLines = (() => {
    try {
      return z
        .array(guestLineSchema)
        .max(25)
        .safeParse(JSON.parse(String(formData.get('lines') ?? '[]')));
    } catch {
      return { success: false as const };
    }
  })();
  if (!parsedLines.success) return { error: 'Your guest cart could not be read safely.' };

  const { repository, user } = await getRequiredCartSession('/cart');
  try {
    const result = await repository.mergeGuestLines(user.id, parsedLines.data);
    revalidatePath('/cart');
    return result;
  } catch (error) {
    return { error: getCartError(error) };
  }
}
