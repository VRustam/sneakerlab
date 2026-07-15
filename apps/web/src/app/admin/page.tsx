import Link from 'next/link';
import { Package, ReceiptText, TriangleAlert, WalletCards } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminTable } from '@/components/admin/admin-table';
import { StatusBadge } from '@/components/admin/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { formatPrice } from '@/lib/catalog/catalog-format';
import { SupabaseAdminRepository } from '@/lib/admin/repository';
import { requireAdminPage } from '@/lib/admin/server';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Admin dashboard' };

const metricCards = [
  { key: 'activeProductCount', label: 'Active products', icon: Package },
  { key: 'lowStockCount', label: 'Low-stock products / variants', icon: TriangleAlert },
  { key: 'totalOrderCount', label: 'Total demo orders', icon: ReceiptText },
  { key: 'pendingOrProcessingCount', label: 'Pending or processing', icon: WalletCards },
] as const;

export default async function AdminPage() {
  const context = await requireAdminPage();
  const dashboard = await new SupabaseAdminRepository(context.client).getDashboard();
  return (
    <div className="space-y-7">
      <AdminPageHeader
        description="Current catalog health and demo-order activity, loaded through the signed-in admin session."
        title="Commerce dashboard"
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(({ key, label, icon: Icon }) => (
          <Card key={key}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{label}</CardTitle>
              <Icon className="size-4 text-primary" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-bold">{dashboard[key]}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Demo gross order value</CardTitle>
          <p className="text-sm text-muted-foreground">
            Completed and in-flight demo orders, excluding cancelled orders.
          </p>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-3xl font-bold">{formatPrice(dashboard.grossOrderValue)}</p>
        </CardContent>
      </Card>
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Recent orders</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Latest customer snapshots and permitted workflow state.
            </p>
          </div>
          <Link className={cn(buttonVariants({ variant: 'outline' }))} href="/admin/orders">
            View all orders
          </Link>
        </div>
        <AdminTable
          emptyDescription="New demo orders will appear here."
          emptyTitle="No orders yet"
          headers={['Order', 'Customer', 'Total', 'Status', 'Created']}
        >
          {dashboard.recentOrders.length
            ? dashboard.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-4 font-mono text-xs font-bold">
                    <Link className="hover:underline" href={'/admin/orders/' + order.id}>
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium">{order.profileName ?? order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-4 font-mono">{formatPrice(order.total)}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            : null}
        </AdminTable>
      </section>
    </div>
  );
}
