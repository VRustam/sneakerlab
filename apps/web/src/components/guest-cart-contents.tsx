'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { EmptyState } from '@/components/states';
import { Button, buttonVariants } from '@/components/ui/button';
import { formatPrice } from '@/lib/catalog/catalog-format';
import { getGuestCartSubtotal, updateGuestCartLine } from '@/lib/commerce/cart-utils';
import {
  readGuestCart,
  subscribeToGuestCart,
  writeGuestCart,
} from '@/lib/commerce/guest-cart-storage';
import type { GuestCartLine } from '@/lib/commerce/types';
import { cn } from '@/lib/utils';

const emptyGuestCart: GuestCartLine[] = [];

export function GuestCartContents() {
  const lines = useSyncExternalStore(subscribeToGuestCart, readGuestCart, () => emptyGuestCart);

  function update(key: string, quantity: number) {
    const next = updateGuestCartLine(lines, key, quantity);
    writeGuestCart(next);
  }

  if (lines.length === 0) {
    return (
      <EmptyState
        action={
          <Link className={cn(buttonVariants())} href="/products">
            Browse products
          </Link>
        }
        description="Guest cart items are stored only in this browser until you sign in."
        title="Your guest cart is empty"
      />
    );
  }

  const subtotal = getGuestCartSubtotal(lines);
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <ul
        className="divide-y divide-border rounded-xl border border-border bg-card"
        aria-label="Guest cart items"
      >
        {lines.map((line) => (
          <li className="flex items-start justify-between gap-4 p-5" key={line.key}>
            <div className="space-y-2">
              <p className="font-bold">{line.productName}</p>
              {line.colorName || line.size ? (
                <p className="text-sm text-muted-foreground">
                  {line.colorName} · Size {line.size}
                </p>
              ) : null}
              <div className="flex items-center gap-2">
                <Button
                  aria-label="Decrease guest quantity"
                  disabled={line.quantity <= 1}
                  onClick={() => update(line.key, line.quantity - 1)}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  −
                </Button>
                <span className="min-w-8 text-center text-sm font-semibold">{line.quantity}</span>
                <Button
                  aria-label="Increase guest quantity"
                  disabled={line.quantity >= line.availableStock}
                  onClick={() => update(line.key, line.quantity + 1)}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  +
                </Button>
                <Button onClick={() => update(line.key, 0)} size="sm" type="button" variant="ghost">
                  Remove
                </Button>
              </div>
            </div>
            <p className="whitespace-nowrap font-semibold">
              {formatPrice(line.price * line.quantity)}
            </p>
          </li>
        ))}
      </ul>
      <aside className="space-y-5 rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
        <h2 className="text-lg font-bold">Guest cart</h2>
        <p className="flex items-center justify-between border-y border-border py-4 font-semibold">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Prices and stock are revalidated after sign-in. Demo checkout requires an account.
        </p>
        <Link className={cn(buttonVariants({ size: 'lg' }), 'w-full')} href="/login?next=%2Fcart">
          Sign in to merge and checkout
        </Link>
      </aside>
    </div>
  );
}
