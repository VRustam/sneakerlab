import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { CouponForm } from '@/components/admin/coupon-form';
import { requireAdminPage } from '@/lib/admin/server';

export const metadata = { title: 'New Coupon — Admin' };

export default async function NewCouponPage() {
  await requireAdminPage();

  return (
    <div className="space-y-7">
      <AdminPageHeader
        description="Create a new discount coupon."
        title="New Coupon"
      />
      <CouponForm />
    </div>
  );
}
