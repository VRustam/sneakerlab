'use client';

import { useState, useSyncExternalStore, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { mergeGuestCartAction } from '@/app/actions/cart';
import { Button } from '@/components/ui/button';
import {
  clearGuestCart,
  readGuestCart,
  subscribeToGuestCart,
} from '@/lib/commerce/guest-cart-storage';
import type { GuestCartLine } from '@/lib/commerce/types';

const emptyGuestCart: GuestCartLine[] = [];

export function GuestCartMerge() {
  const router = useRouter();
  const lines = useSyncExternalStore(subscribeToGuestCart, readGuestCart, () => emptyGuestCart);
  const [status, setStatus] = useState<string>();
  const [isPending, startTransition] = useTransition();

  if (lines.length === 0) return null;

  function merge() {
    setStatus(undefined);
    startTransition(async () => {
      const formData = new FormData();
      formData.set(
        'lines',
        JSON.stringify(
          lines.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })),
        ),
      );
      const result = await mergeGuestCartAction(formData);
      if (result.error) {
        setStatus(result.error);
        return;
      }
      clearGuestCart();
      setStatus(`${result.merged ?? 0} guest cart line${result.merged === 1 ? '' : 's'} merged.`);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
      <p className="text-sm">
        You have {lines.length} saved guest cart line{lines.length === 1 ? '' : 's'} in this
        browser.
      </p>
      <div className="flex items-center gap-3">
        <Button disabled={isPending} onClick={merge} type="button" variant="outline">
          {isPending ? 'Merging…' : 'Add them to my cart'}
        </Button>
        {status ? (
          <p className="text-sm text-muted-foreground" role="status">
            {status}
          </p>
        ) : null}
      </div>
    </div>
  );
}
