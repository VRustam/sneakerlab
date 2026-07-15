import Link from 'next/link';
import { Plus } from 'lucide-react';
import { setProductActiveAction } from '@/app/actions/admin';
import { AdminConfirmForm } from '@/components/admin/admin-confirm-form';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminPagination, AdminTable } from '@/components/admin/admin-table';
import { StatusBadge } from '@/components/admin/status-badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { formatPrice } from '@/lib/catalog/catalog-format';
import { SupabaseAdminRepository } from '@/lib/admin/repository';
import { requireAdminPage } from '@/lib/admin/server';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Admin products' };

function getText(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : '';
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}) {
  const params = await searchParams;
  const q = getText(params.q);
  const requestedPage = Number(getText(params.page)) || 1;
  const context = await requireAdminPage();
  const products = await new SupabaseAdminRepository(context.client).listProducts(q, requestedPage);
  const hrefForPage = (page: number) =>
    '/admin/products?q=' + encodeURIComponent(q) + '&page=' + page;

  return (
    <div className="space-y-7">
      <AdminPageHeader
        action={
          <Link className={cn(buttonVariants({}))} href="/admin/products/new">
            <Plus className="size-4" aria-hidden="true" /> New product
          </Link>
        }
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Products' }]}
        description="Create, edit, activate, or safely deactivate catalog products."
        title="Products"
      />
      <form
        className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4"
        role="search"
      >
        <label className="sr-only" htmlFor="product-search">
          Search products
        </label>
        <input
          className="h-10 min-w-[16rem] flex-1 rounded-md border border-input bg-background px-3 text-sm"
          defaultValue={q}
          id="product-search"
          name="q"
          placeholder="Search product name or slug"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>
      <AdminTable
        emptyAction={
          <Link className={cn(buttonVariants({}))} href="/admin/products/new">
            Create product
          </Link>
        }
        emptyDescription="Try another search or create a catalog product."
        emptyTitle="No products found"
        headers={['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions']}
      >
        {products.rows.length
          ? products.rows.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-4">
                  <p className="font-semibold">{product.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{product.slug}</p>
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {product.category?.name ?? 'Uncategorized'}
                </td>
                <td className="px-4 py-4 font-mono">{formatPrice(product.price)}</td>
                <td className="px-4 py-4">
                  {product.variants.length
                    ? product.variants.reduce((sum, variant) => sum + variant.stock, 0) +
                      ' across variants'
                    : product.stock}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={product.is_active ? 'active' : 'inactive'} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                      href={'/admin/products/' + product.id + '/edit'}
                    >
                      Edit
                    </Link>
                    <AdminConfirmForm
                      action={setProductActiveAction}
                      confirmLabel={product.is_active ? 'Deactivate' : 'Activate'}
                      description={
                        product.is_active
                          ? 'The product will be hidden from the public catalog while preserving orders and product history.'
                          : 'The product will become visible in the public catalog again.'
                      }
                      fields={{ id: product.id, isActive: String(!product.is_active) }}
                      title={product.is_active ? 'Deactivate product?' : 'Activate product?'}
                      triggerLabel={product.is_active ? 'Deactivate' : 'Activate'}
                      destructive={product.is_active}
                    />
                  </div>
                </td>
              </tr>
            ))
          : null}
      </AdminTable>
      <AdminPagination
        hasNextPage={products.hasNextPage}
        hrefForPage={hrefForPage}
        page={products.page}
        totalCount={products.totalCount}
      />
    </div>
  );
}
