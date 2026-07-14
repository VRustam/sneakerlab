import { EmptyState } from '@/components/states';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';

export const metadata = { title: 'Products' };

export default function ProductsPage() {
  return (
    <PageContainer className="space-y-10 py-12 sm:py-16">
      <PageHeader
        eyebrow="Catalog"
        title="Find your next pair"
        description="The Supabase-backed catalog, filters, and product details arrive in Phase 3."
      />
      <EmptyState
        description="Catalog products will appear after the Phase 2 data model is ready."
        title="The catalog is being prepared"
      />
    </PageContainer>
  );
}
