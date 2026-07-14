import type { Metadata } from 'next';
import { CatalogPageContent } from '@/app/products/catalog-page-content';
import type { CatalogSearchParams } from '@/lib/catalog/catalog-filters';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogSearchParams>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const title = `${slug.replaceAll('-', ' ')} sneakers`;
  return {
    title,
    description: `Browse active ${title} in the SneakerLab catalog.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  return <CatalogPageContent lockedCategory={slug} searchParams={resolvedSearchParams} />;
}
