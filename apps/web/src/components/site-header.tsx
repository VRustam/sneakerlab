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

function SneakerIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Sole */}
      <path d="M3 18h18c0-2-1-3-3-3H6c-2 0-3 1-3 3z" />
      {/* Upper shoe body */}
      <path d="M21 15V9c0-1.5-1.5-2.5-3-2.5h-4l-3 4-4-1L3 13.5" />
      {/* laces */}
      <path d="M12 8.5l2 2M10.5 7l2 2" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/75 backdrop-blur-xl">
      <PageContainer className="flex h-[4.5rem] items-center justify-between gap-4">
        <Link
          className="flex items-center gap-2.5 text-lg font-black tracking-[-0.06em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href="/"
        >
          <SneakerIcon className="size-6 text-primary animate-pulse" />
          <span>SneakerLab</span>
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

