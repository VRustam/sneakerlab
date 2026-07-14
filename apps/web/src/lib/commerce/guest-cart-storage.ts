import { z } from 'zod';
import type { GuestCartLine } from '@/lib/commerce/types';

export const guestCartStorageKey = 'sneakerlab.guest-cart.v1';
const emptyGuestCart: GuestCartLine[] = [];
let cachedRaw: string | null | undefined;
let cachedCart: GuestCartLine[] = emptyGuestCart;

const guestCartLineSchema = z.object({
  key: z.string().min(1),
  productId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
  variantId: z
    .string()
    .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    .nullable(),
  productName: z.string().min(1).max(160),
  imageUrl: z.string().url().nullable(),
  price: z.number().finite().nonnegative(),
  colorName: z.string().max(80).nullable(),
  size: z.string().max(32).nullable(),
  availableStock: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
});

const guestCartSchema = z.array(guestCartLineSchema).max(25);

export function parseGuestCart(value: string | null): GuestCartLine[] {
  if (!value) return [];
  try {
    const parsed = guestCartSchema.safeParse(JSON.parse(value));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function serializeGuestCart(lines: GuestCartLine[]) {
  return JSON.stringify(guestCartSchema.parse(lines));
}

export function readGuestCart() {
  if (typeof window === 'undefined') return emptyGuestCart;
  const raw = window.localStorage.getItem(guestCartStorageKey);
  if (raw === cachedRaw) return cachedCart;
  cachedRaw = raw;
  cachedCart = parseGuestCart(raw);
  return cachedCart;
}

export function writeGuestCart(lines: GuestCartLine[]) {
  if (typeof window === 'undefined') return;
  const raw = serializeGuestCart(lines);
  cachedRaw = raw;
  cachedCart = lines;
  window.localStorage.setItem(guestCartStorageKey, raw);
  window.dispatchEvent(new Event('sneakerlab:guest-cart-change'));
}

export function clearGuestCart() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(guestCartStorageKey);
  cachedRaw = null;
  cachedCart = emptyGuestCart;
  window.dispatchEvent(new Event('sneakerlab:guest-cart-change'));
}

export function subscribeToGuestCart(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  const onStorage = (event: StorageEvent) => {
    if (event.key === guestCartStorageKey) listener();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener('sneakerlab:guest-cart-change', listener);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('sneakerlab:guest-cart-change', listener);
  };
}
