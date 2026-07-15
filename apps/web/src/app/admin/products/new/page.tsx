import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ProductForm } from '@/components/admin/product-form';
import { buttonVariants } from '@/components/ui/button';
import { SupabaseAdminRepository } from '@/lib/admin/repository';
import { requireAdminPage } from '@/lib/admin/server';
import { cn } from '@/lib/utils';

export const metadata = { title: 'New product' };

export default async function NewAdminProductPage() {
  const context = await requireAdminPage();
  const categories = await new SupabaseAdminRepository(context.client).listCategories();
  return (
    <div className="space-y-7">
      <AdminPageHeader
        action={
          <Link className={cn(buttonVariants({ variant: 'outline' }))} href="/admin/products">
            Back to products
          </Link>
        }
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Products', href: '/admin/products' },
          { label: 'New' },
        ]}
        description="Create the catalog record first, then use its edit screen for authenticated media uploads."
        title="New product"
      />
      <ProductForm
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
      />
    </div>
  );
}
