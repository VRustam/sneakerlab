import { BarChart3, LayoutDashboard, Package, ReceiptText, Shapes, Ticket } from 'lucide-react';
import Link from 'next/link';
import { LogoutButton } from '@/components/logout-button';

const navigation = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Shapes },
  { href: '/admin/orders', label: 'Orders', icon: ReceiptText },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export function AdminShellNavigation() {
  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card lg:block">
        <nav className="sticky top-0 flex min-h-screen flex-col gap-2 p-4" aria-label="Admin">
          <Link className="mb-5 px-3 py-2 text-lg font-bold tracking-tight" href="/admin">
            SneakerLab <span className="text-primary">Admin</span>
          </Link>
          {navigation.map(({ href, icon: Icon, label }) => (
            <Link
              className="flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              href={href}
              key={href}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
          <div className="mt-auto border-t border-border pt-3">
            <Link
              className="mb-2 flex min-h-10 items-center px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              href="/"
            >
              View storefront
            </Link>
            <LogoutButton />
          </div>
        </nav>
      </aside>
      <details className="border-b border-border bg-card lg:hidden">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-4 text-sm font-bold">
          SneakerLab Admin
          <span className="text-xs font-medium text-muted-foreground">Menu</span>
        </summary>
        <nav className="grid gap-1 border-t border-border p-3" aria-label="Admin mobile">
          {navigation.map(({ href, icon: Icon, label }) => (
            <Link
              className="flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold hover:bg-accent"
              href={href}
              key={href}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
          <Link className="min-h-10 px-3 py-2 text-sm font-medium text-muted-foreground" href="/">
            View storefront
          </Link>
          <LogoutButton />
        </nav>
      </details>
    </>
  );
}
