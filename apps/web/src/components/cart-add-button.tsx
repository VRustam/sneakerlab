'use client';

import { useState, useTransition } from 'react';
import { addToCartAction } from '@/app/actions/cart';
import { Button } from '@/components/ui/button';
import { addGuestCartLine } from '@/lib/commerce/cart-utils';
import { readGuestCart, writeGuestCart } from '@/lib/commerce/guest-cart-storage';
import type { GuestCartPayload } from '@/lib/commerce/types';

interface CartAddButtonProps {
  isAuthenticated: boolean;
  canAdd: boolean;
  payload: GuestCartPayload;
  returnPath: string;
}

export function CartAddButton({
  isAuthenticated,
  canAdd,
  payload,
  returnPath,
}: CartAddButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function addGuestLine() {
    if (!canAdd) return;
    writeGuestCart(addGuestCartLine(readGuestCart(), payload));
    window.location.assign('/cart?guest=1');
  }

  function addAuthenticatedLine() {
    if (!canAdd) return;
    setError(undefined);
    startTransition(async () => {
      const formData = new FormData();
      formData.set('productId', payload.productId);
      if (payload.variantId) formData.set('variantId', payload.variantId);
      formData.set('returnPath', returnPath);
      const result = await addToCartAction(formData);
      setError(result.error ?? 'Added to your cart.');
    });
  }

  return (
    <div className="space-y-2">
      <Button
        disabled={!canAdd || isPending}
        onClick={isAuthenticated ? addAuthenticatedLine : addGuestLine}
        size="lg"
        type="button"
      >
        {isPending ? 'Adding…' : canAdd ? 'Add to cart' : 'Out of stock'}
      </Button>
      {error ? (
        <p
          className={
            error.startsWith('Added') ? 'text-sm text-primary' : 'text-sm text-destructive'
          }
          role="status"
        >
          {error}
        </p>
      ) : null}
      {!isAuthenticated && canAdd ? (
        <p className="text-sm text-muted-foreground">
          Saved locally until you sign in for demo checkout.
        </p>
      ) : null}
    </div>
  );
}
