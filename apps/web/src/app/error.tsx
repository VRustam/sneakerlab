'use client';

import { PageContainer } from '@/components/page-container';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/states';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageContainer className="space-y-4 py-16">
      <ErrorState description="Please retry the page. If the problem continues, return home and try again later." />
      <Button onClick={reset}>Try again</Button>
    </PageContainer>
  );
}
