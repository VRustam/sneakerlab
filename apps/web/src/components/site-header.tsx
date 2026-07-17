import Link from 'next/link';
import { MobileNavigation } from '@/components/mobile-navigation';
import { PageContainer } from '@/components/page-container';
import { SearchDialog } from '@/components/search-dialog';
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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/75 backdrop-blur-xl">
      <PageContainer className="flex h-[4.5rem] items-center justify-between gap-4">
        <Link
          className="text-lg font-black tracking-[-0.06em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href="/"
        >
          SneakerLab
        </Link>
        <div className="hidden md:block">
          <SearchDialog />
        </div>
        <nav aria-label="Primary navigation" className="hidden items-center gap-6 md:flex">
          {navigation.map((item) => (
            <Link
              className="text-sm font-bold text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

