import { CatalogSkeleton } from '@/components/catalog-skeleton';
import { PageContainer } from '@/components/page-container';

export default function ProductsLoading() {
  return (
    <PageContainer className="space-y-7 py-10 sm:py-14">
      <div className="h-8 w-64 animate-pulse rounded bg-muted" />
      <CatalogSkeleton />
    </PageContainer>
  );
}
