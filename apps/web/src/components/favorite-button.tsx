import Link from 'next/link';
import { Heart } from 'lucide-react';
import { toggleFavoriteAction } from '@/app/actions/favorites';
import { buttonVariants, Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  productId: string;
  productName: string;
  isAuthenticated: boolean;
  isFavorite: boolean;
  returnPath: string;
  className?: string;
}

export function FavoriteButton({
  productId,
  productName,
  isAuthenticated,
  isFavorite,
  returnPath,
  className,
}: FavoriteButtonProps) {
  const label = isFavorite
    ? `Remove ${productName} from favorites`
    : `Save ${productName} to favorites`;

  if (!isAuthenticated) {
    return (
      <Link
        aria-label={`Sign in to save ${productName} to favorites`}
        className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), className)}
        href={`/login?next=${encodeURIComponent(returnPath)}`}
        title="Sign in to save favorites"
      >
        <Heart aria-hidden="true" className="size-5" />
      </Link>
    );
  }

  return (
    <form action={toggleFavoriteAction} className={className}>
      <input name="productId" type="hidden" value={productId} />
      <input name="returnPath" type="hidden" value={returnPath} />
      <Button aria-label={label} size="icon" title={label} variant="ghost">
        <Heart
          aria-hidden="true"
          className={cn('size-5', isFavorite && 'fill-current text-destructive')}
        />
      </Button>
    </form>
  );
}
