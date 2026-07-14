import Link from 'next/link';
import { PageContainer } from '@/components/page-container';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <PageContainer className="flex min-h-[55vh] flex-col items-start justify-center gap-5">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">404</p>
      <h1 className="text-4xl font-black tracking-tight">This page stepped out.</h1>
      <p className="max-w-lg text-lg text-muted-foreground">
        The route does not exist, or it may have moved while SneakerLab is under construction.
      </p>
      <Link className={buttonVariants()} href="/">
        Back to home
      </Link>
    </PageContainer>
  );
}
