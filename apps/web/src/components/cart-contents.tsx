import Image from 'next/image';
import Link from 'next/link';
import { CartLineControls } from '@/components/cart-line-controls';
import { EmptyState } from '@/components/states';
import { buttonVariants } from '@/components/ui/button';
import { formatPrice } from '@/lib/catalog/catalog-format';
import type { CartSummary } from '@/lib/commerce/types';
import { cn } from '@/lib/utils';

interface CartContentsProps {
  cart: CartSummary;
}

export function CartContents({ cart }: CartContentsProps) {
  if (cart.lines.length === 0) {
    return (
      <EmptyState
        action={
          <Link className={cn(buttonVariants())} href="/products">
            Browse products
          </Link>
        }
        description="Add a product from its detail page to begin your demo order."
        title="Your cart is empty"
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <ul
        className="divide-y divide-border rounded-xl border border-border bg-card"
        aria-label="Cart items"
      >
        {cart.lines.map((line) => (
          <li className="flex gap-4 p-4 sm:p-5" key={line.id}>
            <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-28">
              {line.product?.imageUrl ? (
                <Image
                  alt={line.product.name}
                  className="object-cover"
                  fill
                  sizes="112px"
                  src={line.product.imageUrl}
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              {line.product ? (
                <Link
                  className="text-lg font-bold hover:underline"
                  href={`/products/${line.productId}`}
                >
                  {line.product.name}
                </Link>
              ) : (
                <p className="text-lg font-bold">Unavailable product</p>
              )}
              {line.variant ? (
                <p className="text-sm text-muted-foreground">
                  {line.variant.colorName} · Size {line.variant.size}
                </p>
              ) : null}
              {!line.isAvailable || line.quantity > line.availableStock ? (
                <p className="text-sm font-medium text-destructive" role="alert">
                  This line is unavailable or has less stock than your selected quantity. Remove it
                  or update the quantity.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">{line.availableStock} available now</p>
              )}
              <CartLineControls
                availableStock={line.availableStock}
                cartItemId={line.id}
                quantity={line.quantity}
              />
            </div>
            <p className="whitespace-nowrap font-semibold">
              {formatPrice((line.product?.price ?? 0) * line.quantity)}
            </p>
          </li>
        ))}
      </ul>
      <aside className="space-y-5 rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
        <div>
          <h2 className="text-lg font-bold">Order summary</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {cart.itemCount} item{cart.itemCount === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex items-center justify-between border-y border-border py-4 font-semibold">
          <span>Subtotal</span>
          <span>{formatPrice(cart.subtotal)}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Demo shipping is free and final totals are calculated securely at checkout.
        </p>
        <Link
          aria-disabled={cart.hasUnavailableLine}
          className={cn(
            buttonVariants({ size: 'lg' }),
            'w-full',
            cart.hasUnavailableLine && 'pointer-events-none opacity-50',
          )}
          href="/checkout"
        >
          Continue to demo checkout
        </Link>
      </aside>
    </div>
  );
}
