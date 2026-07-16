import Image from 'next/image';
import Link from 'next/link';
import { FavoriteButton } from '@/components/favorite-button';
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
    <article className="group relative h-full overflow-hidden rounded-[1.55rem] border border-white/10 bg-card/75 shadow-[0_24px_65px_-34px_rgba(0,0,0,0.95)] transition duration-500 hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_30px_72px_-28px_rgba(126,255,55,0.22)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Link aria-label={`View ${product.name}`} className="block h-full" href={detailPath}>
          <Image
            alt={image.alt}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.075]"
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 640px) 44vw, 92vw"
            src={image.src}
          />
        </Link>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-background/85 via-background/18 to-transparent" />
        <FavoriteButton
          className="absolute right-3 top-3 rounded-full border border-white/15 bg-background/70 shadow-lg backdrop-blur"
          isAuthenticated={isAuthenticated}
          isFavorite={favoriteIds.has(product.id)}
          productId={product.id}
          productName={product.name}
          returnPath={returnPath}
        />
      </div>
      <div className="space-y-3 p-5">
        <div className="space-y-1">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-primary">
            {product.category?.name ?? 'SneakerLab'}
          </p>
          <Link
            className="block text-xl font-black tracking-tight transition-colors hover:text-primary"
            href={detailPath}
          >
            {product.name}
          </Link>
          {product.short_description ? (
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              {product.short_description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
          <p className="text-lg font-black tracking-tight">
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
                ? 'text-xs font-bold uppercase tracking-wide text-muted-foreground'
                : 'text-xs font-bold uppercase tracking-wide text-primary'
            }
          >
            {stockLabel}
          </span>
        </div>
      </div>
    </article>
  );
}
