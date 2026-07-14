import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Box, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';
import { PageContainer } from '@/components/page-container';
import { ProductGrid } from '@/components/product-grid';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorState } from '@/components/states';
import { getCatalogSession } from '@/lib/catalog/catalog-server';
import type { CatalogCategory, CatalogProduct } from '@/lib/catalog/types';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Box,
    title: '3D-ready details',
    description:
      'Inspect supported product models from every angle when the experience arrives in Phase 7.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure demo shopping',
    description:
      'A validation-first, Supabase-backed demo checkout with no real payment collection.',
  },
  {
    icon: Smartphone,
    title: 'Web and mobile',
    description: 'A consistent customer experience across the responsive site and Flutter app.',
  },
];

export default async function HomePage() {
  const { repository, user } = await getCatalogSession();
  let featured: CatalogProduct[] = [];
  let categories: CatalogCategory[] = [];
  let catalogError = false;

  if (repository) {
    try {
      [featured, categories] = await Promise.all([
        repository.getFeaturedProducts(),
        repository.getCategories(),
      ]);
    } catch (error) {
      console.error('Home catalog sections failed to load', error);
      catalogError = true;
    }
  }

  return (
    <>
      <section className="border-b border-border bg-muted/30 py-16 sm:py-24">
        <PageContainer className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-7">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Modern sneaker commerce
            </p>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-balance sm:text-6xl">
              Explore sneakers from every angle.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              SneakerLab is a polished portfolio platform for discovering thoughtfully detailed,
              generic sneakers across a responsive web storefront and a companion mobile app.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link className={cn(buttonVariants({ size: 'lg' }))} href="/products">
                Explore products <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
                href="/register"
              >
                Create an account
              </Link>
            </div>
          </div>
          {featured[0] ? (
            <Link
              className="group relative min-h-80 overflow-hidden rounded-2xl border border-border bg-muted shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={`/products/${featured[0].slug}`}
            >
              <Image
                alt={`${featured[0].name} featured sneaker`}
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                src={
                  featured[0].images[0]?.image_url ??
                  featured[0].image_url ??
                  'https://placehold.co/1200x1200/png?text=SneakerLab'
                }
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-8 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80">
                  Featured model
                </p>
                <p className="mt-2 text-2xl font-bold">{featured[0].name}</p>
              </div>
            </Link>
          ) : (
            <div className="relative min-h-80 overflow-hidden rounded-2xl border border-border bg-[radial-gradient(circle_at_30%_20%,var(--primary),transparent_25%),linear-gradient(135deg,#d9d7d1,#f8f7f4)] p-8 shadow-sm">
              <div className="absolute inset-x-10 bottom-14 h-24 rotate-[-10deg] rounded-[45%_60%_38%_35%] border border-white/70 bg-white/85 shadow-xl" />
              <p className="relative text-sm font-semibold uppercase tracking-[0.16em] text-foreground/70">
                Featured model
              </p>
              <p className="relative mt-2 max-w-44 text-2xl font-bold">Catalog loading locally</p>
            </div>
          )}
        </PageContainer>
      </section>
      <PageContainer className="space-y-14 py-16 sm:py-24">
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Featured now
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Pairs with a point of view</h2>
            </div>
            <Link
              className={cn(buttonVariants({ variant: 'outline' }))}
              href="/products?featured=1"
            >
              See featured styles
            </Link>
          </div>
          {catalogError ? (
            <ErrorState title="Featured products are unavailable" />
          ) : featured.length > 0 ? (
            <ProductGrid isAuthenticated={Boolean(user)} products={featured} returnPath="/" />
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Add local public Supabase configuration to display featured catalog products here.
              </CardContent>
            </Card>
          )}
        </section>
        <section className="space-y-6" aria-labelledby="collections-title">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Collections
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight" id="collections-title">
              Shop by intent
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={`/categories/${category.slug}`}
                key={category.id}
              >
                <p className="font-bold group-hover:underline">{category.name}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
        <section className="grid gap-5 lg:grid-cols-2">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <Smartphone className="size-6" aria-hidden="true" />
              <CardTitle className="mt-3 text-primary-foreground">
                Your rotation, on mobile
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                The Flutter companion keeps the same catalog and customer account experience close
                at hand.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-primary-foreground/80">
                Customer commerce flows arrive after the web store is complete.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Sparkles className="size-6 text-primary" aria-hidden="true" />
              <CardTitle className="mt-3">3D-ready product stories</CardTitle>
              <CardDescription>
                Supported products will gain a GLB viewer with accessible image fallback in Phase 7.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
        <section className="grid gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader>
                <Icon className="size-6 text-primary" aria-hidden="true" />
                <CardTitle className="mt-3">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>
      </PageContainer>
    </>
  );
}
