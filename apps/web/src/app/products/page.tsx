import type { Metadata } from 'next';
import { CatalogPageContent } from '@/app/products/catalog-page-content';
import type { CatalogSearchParams } from '@/lib/catalog/catalog-filters';

export const metadata: Metadata = {
  title: 'Sneaker catalog',
  description:
    'Browse active SneakerLab styles by category, size, color, price, and featured status.',
  openGraph: {
    title: 'SneakerLab catalog',
    description: 'Browse active sneaker styles with shareable catalog filters.',
  },
};

interface ProductsPageProps {
  searchParams: Promise<CatalogSearchParams>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  return <CatalogPageContent searchParams={await searchParams} />;
}
