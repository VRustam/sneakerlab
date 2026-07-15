import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ProductForm } from '@/components/admin/product-form';
import { ProductMediaManager } from '@/components/admin/product-media-manager';
import { buttonVariants } from '@/components/ui/button';
import { SupabaseAdminRepository } from '@/lib/admin/repository';
import { requireAdminPage } from '@/lib/admin/server';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Edit product' };

export default async function EditAdminProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const context = await requireAdminPage();
  const repository = new SupabaseAdminRepository(context.client);
  const [product, categories] = await Promise.all([
    repository.getProduct(id),
    repository.listCategories(),
  ]);
  if (!product) notFound();
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
          { label: product.name },
        ]}
        description="Catalog edits are validated in this server action and again by database constraints and RLS."
        title={'Edit ' + product.name}
      />
      <ProductForm
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
        product={product}
      />
      <ProductMediaManager product={product} />
    </div>
  );
}
