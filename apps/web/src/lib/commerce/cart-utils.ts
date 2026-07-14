import type { CartLine, CartSummary, GuestCartLine, GuestCartPayload } from '@/lib/commerce/types';

export function getCartLineKey(productId: string, variantId: string | null) {
  return `${productId}:${variantId ?? 'product'}`;
}

export function clampCartQuantity(quantity: number, stock: number) {
  return Math.max(0, Math.min(Math.floor(quantity), Math.max(0, Math.floor(stock))));
}

export function getCartSummary(lines: CartLine[]): CartSummary {
  const itemCount = lines.reduce((count, line) => count + line.quantity, 0);
  const subtotal = lines.reduce(
    (total, line) => total + (line.product?.price ?? 0) * line.quantity,
    0,
  );
  return {
    lines,
    itemCount,
    subtotal: Number(subtotal.toFixed(2)),
    hasUnavailableLine: lines.some(
      (line) => !line.isAvailable || line.quantity > line.availableStock,
    ),
  };
}

export function addGuestCartLine(
  lines: GuestCartLine[],
  payload: GuestCartPayload,
): GuestCartLine[] {
  const key = getCartLineKey(payload.productId, payload.variantId);
  const existing = lines.find((line) => line.key === key);
  if (!existing) {
    if (payload.availableStock < 1) return lines;
    return [...lines, { ...payload, key, quantity: 1 }];
  }

  return lines.map((line) =>
    line.key === key
      ? {
          ...line,
          ...payload,
          quantity: clampCartQuantity(line.quantity + 1, payload.availableStock),
        }
      : line,
  );
}

export function updateGuestCartLine(
  lines: GuestCartLine[],
  key: string,
  quantity: number,
): GuestCartLine[] {
  return lines.flatMap((line) => {
    if (line.key !== key) return [line];
    const nextQuantity = clampCartQuantity(quantity, line.availableStock);
    return nextQuantity > 0 ? [{ ...line, quantity: nextQuantity }] : [];
  });
}

export function getGuestCartSubtotal(lines: GuestCartLine[]) {
  return Number(lines.reduce((total, line) => total + line.price * line.quantity, 0).toFixed(2));
}
