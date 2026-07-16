import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Box, Move3D, ShieldCheck, Sparkles } from 'lucide-react';
import { ErrorState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { ProductGrid } from '@/components/product-grid';
import { buttonVariants } from '@/components/ui/button';
import { getCatalogSession } from '@/lib/catalog/catalog-server';
import type { CatalogCategory, CatalogProduct } from '@/lib/catalog/types';
import { cn } from '@/lib/utils';

const categoryAccents: Record<string, string> = {
  court: 'from-[#e8e2d9] via-[#778eb4] to-[#15233d]',
  lifestyle: 'from-[#513472] via-[#132d6b] to-[#080b16]',
  running: 'from-[#0c1722] via-[#0c4fa5] to-[#68ddff]',
  trail: 'from-[#101b13] via-[#506c35] to-[#c0682e]',
};

const proofPoints = [
  { label: 'Live catalog', value: '09' },
  { label: 'Angle control', value: '360°' },
  { label: 'Motion', value: '3D' },
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

  const heroProduct = featured.find((product) => product.slug === 'pulse-layer') ?? featured[0];
  const heroImage =
    heroProduct?.images[0]?.image_url ??
    heroProduct?.image_url ??
    '/images/products/pulse-layer.png';

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(101,119,255,0.34),transparent_25%),radial-gradient(circle_at_15%_82%,rgba(188,255,78,0.14),transparent_24%),linear-gradient(130deg,#07100e,#091017_56%,#101127)]" />
        <PageContainer className="relative grid min-h-[calc(100svh-4.5rem)] items-center gap-10 py-12 lg:grid-cols-[0.93fr_1.07fr] lg:py-20">
          <div className="relative z-10 max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-primary">
              <Sparkles aria-hidden="true" className="size-3.5" />
              The new rotation
            </div>
            <div className="space-y-5">
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-white/45">
                SneakerLab / 2026
              </p>
              <h1
                aria-label="Built to move. Made to be seen."
                className="max-w-xl text-5xl font-black leading-[0.91] tracking-[-0.075em] text-balance sm:text-7xl lg:text-8xl"
              >
                Built to move.
                <span className="block text-primary">Made to be seen.</span>
              </h1>
              <p className="max-w-lg text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
                A focused sneaker rotation with tactile product stories, cinematic imagery, and a
                live 3D point of view.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className={cn(buttonVariants({ size: 'lg' }), 'rounded-full px-6')}
                href="/products"
              >
                Explore products <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'outline' }),
                  'rounded-full border-white/20 bg-white/5 px-6 hover:bg-white/10',
                )}
                href="/products/pulse-layer"
              >
                Enter 3D preview <Move3D aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <dl className="grid max-w-md grid-cols-3 border-t border-white/12 pt-6">
              {proofPoints.map((point) => (
                <div key={point.label}>
                  <dt className="text-[0.64rem] font-bold uppercase tracking-[0.16em] text-white/38">
                    {point.label}
                  </dt>
                  <dd className="mt-1 text-xl font-black tracking-tight text-white">
                    {point.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <Link
            className="group relative mx-auto aspect-square w-full max-w-[42rem] overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#060a0f] shadow-[0_42px_100px_-40px_rgba(0,0,0,0.98)]"
            href={`/products/${heroProduct?.slug ?? 'pulse-layer'}`}
          >
            <Image
              alt={`${heroProduct?.name ?? 'Pulse Layer'} featured sneaker`}
              className="object-cover transition duration-1000 ease-out group-hover:scale-105"
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              src={heroImage}
            />
            <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(0,0,0,0.56),transparent_45%,rgba(0,0,0,0.18))]" />
            <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[0.64rem] font-bold uppercase tracking-[0.18em] text-white/75 backdrop-blur sm:left-7 sm:top-7">
              Featured / 01
            </div>
            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 sm:inset-x-7 sm:bottom-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">
                  Interactive silhouette
                </p>
                <p className="mt-1 text-2xl font-black tracking-[-0.05em] text-white sm:text-3xl">
                  {heroProduct?.name ?? 'Pulse Layer'}
                </p>
              </div>
              <span className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight aria-hidden="true" className="size-5" />
              </span>
            </div>
          </Link>
        </PageContainer>
      </section>

      <PageContainer className="space-y-20 py-16 sm:py-24">
        <section className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                Selected pairs
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                The rotation, edited.
              </h2>
            </div>
            <Link
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'rounded-full border-white/15 bg-white/5',
              )}
              href="/products?featured=1"
            >
              See featured styles <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          {catalogError ? (
            <ErrorState title="Featured products are unavailable" />
          ) : featured.length > 0 ? (
            <ProductGrid isAuthenticated={Boolean(user)} products={featured} returnPath="/" />
          ) : (
            <div className="rounded-[1.5rem] border border-white/10 bg-card/70 p-6 text-sm text-muted-foreground">
              Connect the local catalog to reveal the featured rotation.
            </div>
          )}
        </section>

        <section className="grid gap-4 lg:grid-cols-4" aria-labelledby="collections-title">
          <div className="lg:col-span-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
              Shop by intent
            </p>
            <h2
              className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-5xl"
              id="collections-title"
            >
              Find your pace.
            </h2>
          </div>
          {categories.map((category) => (
            <Link
              className={cn(
                'group relative min-h-52 overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br p-6 shadow-[0_24px_60px_-38px_rgba(0,0,0,0.9)] transition duration-500 hover:-translate-y-1 hover:border-primary/40',
                categoryAccents[category.slug] ?? 'from-[#20322b] to-[#0c1413]',
              )}
              href={`/categories/${category.slug}`}
              key={category.id}
            >
              <div className="absolute -right-8 -top-10 size-40 rounded-full border border-white/15 bg-white/10 transition-transform duration-700 group-hover:scale-125" />
              <div className="relative flex h-full flex-col justify-between">
                <Box aria-hidden="true" className="size-5 text-white/80" />
                <div>
                  <p className="text-2xl font-black tracking-[-0.04em] text-white">
                    {category.name}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/65">{category.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </section>

        <section className="grid overflow-hidden rounded-[2rem] border border-white/10 bg-card lg:grid-cols-[0.7fr_1.3fr]">
          <div className="bg-primary p-8 text-primary-foreground sm:p-10">
            <Move3D aria-hidden="true" className="size-8" />
            <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/70">
              Live product study
            </p>
            <h2 className="mt-3 text-4xl font-black leading-none tracking-[-0.055em]">
              Not just another gallery.
            </h2>
          </div>
          <div className="flex flex-col justify-between gap-8 p-8 sm:p-10">
            <p className="max-w-xl text-xl leading-8 text-white/76">
              Pulse Layer turns the shoe into a real-time object: it floats, rotates, and responds
              to touch without making the rest of the store heavy.
            </p>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <ShieldCheck aria-hidden="true" className="size-5 text-primary" />
                Motion respects reduced-motion settings.
              </div>
              <Link className={cn(buttonVariants(), 'rounded-full')} href="/products/pulse-layer">
                View Pulse Layer <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
