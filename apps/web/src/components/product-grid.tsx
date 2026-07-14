import { ProductCard } from '@/components/product-card';
import type { CatalogProduct } from '@/lib/catalog/types';

interface ProductGridProps {
  products: CatalogProduct[];
  favoriteIds?: ReadonlySet<string>;
  isAuthenticated?: boolean;
  returnPath?: string;
}

export function ProductGrid({
  products,
  favoriteIds,
  isAuthenticated,
  returnPath,
}: ProductGridProps) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Products">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard
            favoriteIds={favoriteIds}
            isAuthenticated={isAuthenticated}
            product={product}
            returnPath={returnPath}
          />
        </li>
      ))}
    </ul>
  );
}
