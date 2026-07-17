import { Plus, Ticket } from 'lucide-react';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminTable } from '@/components/admin/admin-table';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SupabaseAdminRepository } from '@/lib/admin/repository';
import { requireAdminPage } from '@/lib/admin/server';

export const metadata = { title: 'Coupons — Admin' };

function formatDiscount(type: string, value: number) {
  return type === 'percentage' ? `${value}%` : `$${value.toFixed(2)}`;
}

function formatDate(date: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function CouponsPage() {
  const context = await requireAdminPage();
  const repo = new SupabaseAdminRepository(context.client);
  const coupons = await repo.listCoupons();

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AdminPageHeader
          description="Manage discount codes and promotions."
          title="Coupons"
        />
        <Link className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')} href="/admin/coupons/new">
          <Plus className="size-4" aria-hidden="true" />
          New coupon
        </Link>
      </div>

      <AdminTable
        emptyDescription="Create your first coupon to offer discounts."
        emptyTitle="No coupons"
        headers={['Code', 'Discount', 'Usage', 'Valid', 'Status']}
      >
        {coupons.map((coupon) => (
          <tr key={coupon.id} className="group">
            <td className="px-4 py-3">
              <Link
                className="font-mono text-sm font-bold text-primary hover:underline"
                href={`/admin/coupons/${coupon.id}`}
              >
                {coupon.code}
              </Link>
              {coupon.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{coupon.description}</p>
              )}
            </td>
            <td className="px-4 py-3 font-mono text-sm">
              {formatDiscount(coupon.discount_type, coupon.discount_value)}
              {coupon.min_order_amount > 0 && (
                <span className="ml-1 text-xs text-muted-foreground">
                  (min ${coupon.min_order_amount})
                </span>
              )}
            </td>
            <td className="px-4 py-3 text-sm">
              {coupon.current_uses}
              {coupon.max_uses ? ` / ${coupon.max_uses}` : ''}
            </td>
            <td className="px-4 py-3 text-xs text-muted-foreground">
              {formatDate(coupon.starts_at)} — {formatDate(coupon.expires_at)}
            </td>
            <td className="px-4 py-3">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  coupon.is_active
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400',
                )}
              >
                <Ticket className="size-3" aria-hidden="true" />
                {coupon.is_active ? 'Active' : 'Inactive'}
              </span>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
