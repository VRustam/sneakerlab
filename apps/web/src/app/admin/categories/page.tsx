import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { CategoryManager } from '@/components/admin/category-manager';
import { SupabaseAdminRepository } from '@/lib/admin/repository';
import { requireAdminPage } from '@/lib/admin/server';

export const metadata = { title: 'Admin categories' };

export default async function AdminCategoriesPage() {
  const context = await requireAdminPage();
  const categories = await new SupabaseAdminRepository(context.client).listCategories();
  return (
    <div className="space-y-7">
      <AdminPageHeader
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Categories' }]}
        description="Linked product counts make it clear why category deletion is intentionally not offered."
        title="Categories"
      />
      <CategoryManager categories={categories} />
    </div>
  );
}
