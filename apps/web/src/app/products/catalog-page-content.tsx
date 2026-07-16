import Link from 'next/link';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { CatalogFilterForm } from '@/components/catalog-filter-form';
import { ErrorState, EmptyState } from '@/components/states';
import { ProductGrid } from '@/components/product-grid';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  getCatalogHref,
  type CatalogSearchParams,
  parseCatalogFilters,
} from '@/lib/catalog/catalog-filters';
import { getCatalogSession } from '@/lib/catalog/catalog-server';
import type { CatalogPage } from '@/lib/catalog/types';
import { cn } from '@/lib/utils';

interface CatalogPageContentProps {
  searchParams: CatalogSearchParams;
  lockedCategory?: string;
}

export async function CatalogPageContent({
  searchParams,
  lockedCategory,
}: CatalogPageContentProps) {
  const filters = parseCatalogFilters(
    searchParams,
    lockedCategory ? { category: lockedCategory, page: 1 } : {},
  );
  const actionPath = lockedCategory ? `/categories/${lockedCategory}` : '/products';
  const returnPath = getCatalogHref(filters, actionPath);
  const { repository, user } = await getCatalogSession();

  if (!repository) {
    return (
      <PageContainer className="py-12 sm:py-16">
        <ErrorState
          description="Add the public Supabase URL and publishable key to load the live catalog."
          title="Catalog connection is not configured"
        />
      </PageContainer>
    );
  }

  let catalog: CatalogPage | null = null;
  let favoriteIds = new Set<string>();

  try {
    const result = await Promise.all([
      repository.list(filters),
      user ? repository.getFavoriteProductIds(user.id) : Promise.resolve(new Set<string>()),
    ]);
    catalog = result[0];
    favoriteIds = result[1];
  } catch (error) {
    console.error('Catalog page failed to load', error);
  }

  if (!catalog) {
    return (
      <PageContainer className="py-12 sm:py-16">
        <ErrorState
          description="The catalog could not be loaded. Please refresh and try again."
          title="Catalog temporarily unavailable"
        />
      </PageContainer>
    );
  }

  const previousPage = getCatalogHref(
    { ...filters, page: Math.max(1, filters.page - 1) },
    actionPath,
  );
  const nextPage = getCatalogHref({ ...filters, page: filters.page + 1 }, actionPath);

  return (
    <PageContainer className="space-y-8 py-8 sm:py-12">
      <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(120deg,rgba(21,39,35,0.98),rgba(10,18,19,0.9)_55%,rgba(20,35,58,0.92))] p-6 shadow-[0_28px_70px_-40px_rgba(0,0,0,0.95)] sm:p-9">
        <PageHeader
          eyebrow={lockedCategory ? 'Category collection' : 'Curated rotation'}
          title={lockedCategory ? `${lockedCategory} sneakers` : 'Find your next pair'}
          description="Built for movement. Filter the live rotation by fit, palette, price, and purpose."
        />
      </div>
      <div className="grid gap-7 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
        <aside aria-label="Product filters" className="order-2 lg:sticky lg:top-24 lg:order-1">
          <CatalogFilterForm
            actionPath={actionPath}
            facets={catalog.facets}
            filters={filters}
            lockedCategory={lockedCategory}
          />
        </aside>
        <section
          className="order-1 min-w-0 space-y-5 lg:order-2"
          aria-labelledby="catalog-results-title"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {catalog.totalCount} {catalog.totalCount === 1 ? 'product' : 'products'} found
              </p>
              <h2 className="sr-only" id="catalog-results-title">
                Catalog results
              </h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/60 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <SlidersHorizontal aria-hidden="true" className="size-4" />
              Filters update the URL
            </span>
          </div>
          {catalog.products.length > 0 ? (
            <>
              <ProductGrid
                favoriteIds={favoriteIds}
                isAuthenticated={Boolean(user)}
                products={catalog.products}
                returnPath={returnPath}
              />
              {catalog.totalCount > filters.pageSize ? (
                <nav
                  aria-label="Catalog pagination"
                  className="flex items-center justify-between gap-4 pt-2"
                >
                  {filters.page > 1 ? (
                    <Link
                      className={cn(buttonVariants({ variant: 'outline' }))}
                      href={previousPage}
                    >
                      <ChevronLeft aria-hidden="true" className="size-4" />
                      Previous
                    </Link>
                  ) : (
                    <Button disabled variant="outline">
                      <ChevronLeft aria-hidden="true" className="size-4" />
                      Previous
                    </Button>
                  )}
                  <p className="text-sm text-muted-foreground">Page {filters.page}</p>
                  {catalog.hasNextPage ? (
                    <Link className={cn(buttonVariants({ variant: 'outline' }))} href={nextPage}>
                      Next
                      <ChevronRight aria-hidden="true" className="size-4" />
                    </Link>
                  ) : (
                    <Button disabled variant="outline">
                      Next
                      <ChevronRight aria-hidden="true" className="size-4" />
                    </Button>
                  )}
                </nav>
              ) : null}
            </>
          ) : (
            <EmptyState
              description="Try clearing a filter or broadening your search to see active products."
              title="No active products match these filters"
            />
          )}
        </section>
      </div>
    </PageContainer>
  );
}
