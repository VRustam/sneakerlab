import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { ProductGrid } from '@/components/product-grid';
import { EmptyState, ErrorState } from '@/components/states';
import { getCatalogSession } from '@/lib/catalog/catalog-server';
import type { CatalogProduct } from '@/lib/catalog/types';

export const metadata: Metadata = {
  title: 'Favorites',
  description: 'Saved SneakerLab products for your next decision.',
};

export default async function FavoritesPage() {
  const { repository, user } = await getCatalogSession();
  if (!user) redirect('/login?next=%2Ffavorites');

  if (!repository) {
    return (
      <PageContainer className="py-12 sm:py-16">
        <ErrorState
          description="Add the public Supabase URL and publishable key to load favorites."
          title="Favorites connection is not configured"
        />
      </PageContainer>
    );
  }

  let products: CatalogProduct[] | null = null;

  try {
    products = await repository.getFavoriteProducts(user.id);
  } catch (error) {
    console.error('Favorites failed to load', error);
  }

  if (!products) {
    return (
      <PageContainer className="py-12 sm:py-16">
        <ErrorState
          description="We could not load your favorites. Please refresh and try again."
          title="Favorites temporarily unavailable"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-8 py-10 sm:py-14">
      <PageHeader
        eyebrow="Your saved list"
        title="Favorites"
        description="Keep the pairs you want to compare close at hand."
      />
      {products.length > 0 ? (
        <ProductGrid
          favoriteIds={new Set(products.map((product) => product.id))}
          isAuthenticated
          products={products}
          returnPath="/favorites"
        />
      ) : (
        <EmptyState
          description="Save products from the catalog to build a short list."
          title="No favorites yet"
        />
      )}
    </PageContainer>
  );
}
