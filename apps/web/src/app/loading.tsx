import { PageContainer } from '@/components/page-container';
import { LoadingState } from '@/components/states';

export default function Loading() {
  return (
    <PageContainer className="py-16">
      <LoadingState />
    </PageContainer>
  );
}
