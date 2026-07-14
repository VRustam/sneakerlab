import Image from 'next/image';
import Link from 'next/link';
import { FavoriteButton } from '@/components/favorite-button';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice, getProductImage, getStockLabel } from '@/lib/catalog/catalog-format';
import type { CatalogProduct } from '@/lib/catalog/types';

interface ProductCardProps {
  product: CatalogProduct;
  favoriteIds?: ReadonlySet<string>;
  isAuthenticated?: boolean;
  returnPath?: string;
}

export function ProductCard({
  product,
  favoriteIds = new Set(),
  isAuthenticated = false,
  returnPath = '/products',
}: ProductCardProps) {
  const image = getProductImage(product);
  const detailPath = `/products/${product.slug}`;
  const stockLabel = getStockLabel(product);

  return (
    <Card className="group h-full overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link aria-label={`View ${product.name}`} className="block h-full" href={detailPath}>
          <Image
            alt={image.alt}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            src={image.src}
          />
        </Link>
        <FavoriteButton
          className="absolute right-3 top-3 rounded-md bg-background/90 shadow-sm"
          isAuthenticated={isAuthenticated}
          isFavorite={favoriteIds.has(product.id)}
          productId={product.id}
          productName={product.name}
          returnPath={returnPath}
        />
      </div>
      <CardContent className="space-y-3 p-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {product.category?.name ?? 'SneakerLab'}
          </p>
          <Link className="block text-lg font-bold hover:underline" href={detailPath}>
            {product.name}
          </Link>
          {product.short_description ? (
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              {product.short_description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold">
            {formatPrice(product.price)}
            {product.compare_at_price && product.compare_at_price > product.price ? (
              <span className="ml-2 text-sm font-normal text-muted-foreground line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            ) : null}
          </p>
          <span
            className={
              stockLabel === 'Out of stock'
                ? 'text-sm font-medium text-muted-foreground'
                : 'text-sm font-medium text-primary'
            }
          >
            {stockLabel}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
