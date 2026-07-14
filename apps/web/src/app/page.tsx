import Link from 'next/link';
import { ArrowRight, Box, ShieldCheck, Smartphone } from 'lucide-react';
import { PageContainer } from '@/components/page-container';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function HomePage() {
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
          <div
            aria-label="Featured sneaker placeholder"
            className="relative min-h-80 overflow-hidden rounded-2xl border border-border bg-[radial-gradient(circle_at_30%_20%,var(--primary),transparent_25%),linear-gradient(135deg,#d9d7d1,#f8f7f4)] p-8 shadow-sm"
          >
            <div className="absolute inset-x-10 bottom-14 h-24 rotate-[-10deg] rounded-[45%_60%_38%_35%] border border-white/70 bg-white/85 shadow-xl" />
            <p className="relative text-sm font-semibold uppercase tracking-[0.16em] text-foreground/70">
              Featured model
            </p>
            <p className="relative mt-2 max-w-44 text-2xl font-bold">Prototype runner</p>
          </div>
        </PageContainer>
      </section>
      <PageContainer className="space-y-14 py-16 sm:py-24">
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Coming next
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                A considered product catalog
              </h2>
            </div>
            <Button variant="outline">Featured placeholders</Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {['Transit Mesh', 'Studio Court', 'Night Shift'].map((name, index) => (
              <Card key={name}>
                <CardHeader>
                  <div className="h-32 rounded-lg bg-muted" aria-hidden="true" />
                  <CardTitle className="mt-4">{name}</CardTitle>
                  <CardDescription>Generic sneaker placeholder {index + 1}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">Catalog integration in Phase 3</p>
                </CardContent>
              </Card>
            ))}
          </div>
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
