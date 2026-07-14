'use client';

import { useState, useTransition } from 'react';
import { removeCartLineAction, updateCartQuantityAction } from '@/app/actions/cart';
import { Button } from '@/components/ui/button';

interface CartLineControlsProps {
  cartItemId: string;
  quantity: number;
  availableStock: number;
}

export function CartLineControls({ cartItemId, quantity, availableStock }: CartLineControlsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function update(nextQuantity: number) {
    setError(undefined);
    startTransition(async () => {
      const formData = new FormData();
      formData.set('cartItemId', cartItemId);
      formData.set('quantity', String(nextQuantity));
      const result = await updateCartQuantityAction(formData);
      setError(result.error);
    });
  }

  function remove() {
    setError(undefined);
    startTransition(async () => {
      const formData = new FormData();
      formData.set('cartItemId', cartItemId);
      const result = await removeCartLineAction(formData);
      setError(result.error);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2" aria-label="Cart quantity controls">
        <Button
          aria-label="Decrease quantity"
          disabled={isPending || quantity <= 1}
          onClick={() => update(quantity - 1)}
          size="icon"
          type="button"
          variant="outline"
        >
          −
        </Button>
        <span aria-live="polite" className="min-w-8 text-center text-sm font-semibold">
          {quantity}
        </span>
        <Button
          aria-label="Increase quantity"
          disabled={isPending || quantity >= availableStock}
          onClick={() => update(quantity + 1)}
          size="icon"
          type="button"
          variant="outline"
        >
          +
        </Button>
      </div>
      <Button disabled={isPending} onClick={remove} size="sm" type="button" variant="ghost">
        Remove
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
