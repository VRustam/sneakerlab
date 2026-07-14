import Link from 'next/link';
import { MobileNavigation } from '@/components/mobile-navigation';
import { PageContainer } from '@/components/page-container';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { href: '/products', label: 'Products' },
  { href: '/favorites', label: 'Favorites' },
  { href: '/cart', label: 'Cart' },
  { href: '/account', label: 'Account' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <PageContainer className="flex h-16 items-center justify-between gap-4">
        <Link
          className="text-lg font-black tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href="/"
        >
          SneakerLab
        </Link>
        <nav aria-label="Primary navigation" className="hidden items-center gap-6 md:flex">
          {navigation.map((item) => (
            <Link
              className="text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
          <Link className={cn(buttonVariants({ size: 'sm' }))} href="/register">
            Create account
          </Link>
        </nav>
        <MobileNavigation />
      </PageContainer>
    </header>
  );
}
