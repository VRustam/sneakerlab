import Link from 'next/link';
import { PageContainer } from '@/components/page-container';

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <PageContainer className="flex flex-col gap-3 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 SneakerLab. A demo commerce portfolio project.</p>
        <div className="flex gap-4">
          <Link
            className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/products"
          >
            Products
          </Link>
          <Link
            className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/login"
          >
            Sign in
          </Link>
        </div>
      </PageContainer>
    </footer>
  );
}
