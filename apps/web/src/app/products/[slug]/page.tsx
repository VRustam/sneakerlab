import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Box, ChevronRight, Truck } from 'lucide-react';
import { FavoriteButton } from '@/components/favorite-button';
import { PageContainer } from '@/components/page-container';
import { ProductGallery } from '@/components/product-gallery';
import { ProductGrid } from '@/components/product-grid';
import { ErrorState } from '@/components/states';
import { VariantSelector } from '@/components/variant-selector';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/catalog/catalog-format';
import { getCatalogSession } from '@/lib/catalog/catalog-server';
import type { ProductDetail } from '@/lib/catalog/types';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { repository } = await getCatalogSession();
  if (!repository) return { title: 'Product details' };

  try {
    const detail = await repository.getProductDetail(slug);
    if (!detail) return { title: 'Product not found' };
    return {
      title: detail.product.name,
      description:
        detail.product.short_description ?? detail.product.description ?? 'SneakerLab product.',
      openGraph: {
        title: `${detail.product.name} | SneakerLab`,
        description:
          detail.product.short_description ?? detail.product.description ?? 'SneakerLab product.',
      },
    };
  } catch {
    return { title: 'Product details' };
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const returnPath = `/products/${slug}`;
  const { repository, user } = await getCatalogSession();

  if (!repository) {
    return (
      <PageContainer className="py-12 sm:py-16">
        <ErrorState
          description="Add the public Supabase URL and publishable key to load product details."
          title="Catalog connection is not configured"
        />
      </PageContainer>
    );
  }

  let detail: ProductDetail | null = null;
  let favoriteIds = new Set<string>();
  let didLoadFail = false;

  try {
    detail = await repository.getProductDetail(slug);
    if (detail && user) favoriteIds = await repository.getFavoriteProductIds(user.id);
  } catch (error) {
    console.error('Product detail failed to load', error);
    didLoadFail = true;
  }

  if (!detail) {
    if (!didLoadFail) notFound();

    return (
      <PageContainer className="py-12 sm:py-16">
        <ErrorState
          description="We could not load this product. Please return to the catalog and try again."
          title="Product temporarily unavailable"
        />
      </PageContainer>
    );
  }

  const { product, relatedProducts } = detail;
  const isFavorite = favoriteIds.has(product.id);

  return (
    <PageContainer className="space-y-10 py-8 sm:py-12">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
      >
        <Link className="hover:text-foreground hover:underline" href="/">
          Home
        </Link>
        <ChevronRight aria-hidden="true" className="size-4" />
        <Link className="hover:text-foreground hover:underline" href="/products">
          Products
        </Link>
        {product.category ? (
          <>
            <ChevronRight aria-hidden="true" className="size-4" />
            <Link
              className="hover:text-foreground hover:underline"
              href={`/categories/${product.category.slug}`}
            >
              {product.category.name}
            </Link>
          </>
        ) : null}
        <ChevronRight aria-hidden="true" className="size-4" />
        <span aria-current="page" className="text-foreground">
          {product.name}
        </span>
      </nav>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)] lg:gap-12">
        <ProductGallery product={product} />
        <div className="space-y-7">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">
                {product.category?.name ?? 'SneakerLab'}
              </p>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{product.name}</h1>
              <p className="text-2xl font-bold">
                {formatPrice(product.price)}
                {product.compare_at_price && product.compare_at_price > product.price ? (
                  <span className="ml-3 text-base font-normal text-muted-foreground line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                ) : null}
              </p>
            </div>
            <FavoriteButton
              className="shrink-0 rounded-md border border-border bg-card"
              isAuthenticated={Boolean(user)}
              isFavorite={isFavorite}
              productId={product.id}
              productName={product.name}
              returnPath={returnPath}
            />
          </div>
          <p className="text-base leading-7 text-muted-foreground">
            {product.description ?? product.short_description}
          </p>
          <VariantSelector variants={product.variants} />
          <Card className="bg-muted/30 shadow-none">
            <CardContent className="flex gap-3 p-4 text-sm text-muted-foreground">
              <Truck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
              <p>Demo store shipping: dispatched in 1–2 business days with easy 30-day returns.</p>
            </CardContent>
          </Card>
          <div className="space-y-2">
            <details className="rounded-lg border border-border bg-card p-4">
              <summary className="cursor-pointer font-semibold">Shipping and returns</summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Orders in this portfolio demo use a transparent flat-rate shipping policy. Returns
                are accepted within 30 days when products are unworn.
              </p>
            </details>
            <details className="rounded-lg border border-border bg-card p-4">
              <summary className="cursor-pointer font-semibold">Care guidance</summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Brush away dry dirt, clean gently with a soft cloth, and air dry away from direct
                heat.
              </p>
            </details>
          </div>
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5">
            <div className="flex items-center gap-3">
              <Box aria-hidden="true" className="size-5 text-primary" />
              <div>
                <p className="font-semibold">3D preview coming in Phase 7</p>
                <p className="text-sm text-muted-foreground">
                  The product image remains available while the interactive GLB viewer is prepared.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {relatedProducts.length > 0 ? (
        <section className="space-y-5" aria-labelledby="related-products-title">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">
              More to explore
            </p>
            <h2 className="mt-2 text-2xl font-bold" id="related-products-title">
              Related {product.category?.name ?? 'styles'}
            </h2>
          </div>
          <ProductGrid
            favoriteIds={favoriteIds}
            isAuthenticated={Boolean(user)}
            products={relatedProducts}
            returnPath={returnPath}
          />
        </section>
      ) : null}
    </PageContainer>
  );
}
