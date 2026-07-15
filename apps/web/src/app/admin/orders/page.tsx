import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminPagination, AdminTable } from '@/components/admin/admin-table';
import { StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/catalog/catalog-format';
import { SupabaseAdminRepository } from '@/lib/admin/repository';
import { requireAdminPage } from '@/lib/admin/server';
import { orderStatusValues, type AdminOrderStatus } from '@/lib/admin/validation';

export const metadata = { title: 'Admin orders' };

function getText(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : '';
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    page?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const q = getText(params.q);
  const rawStatus = getText(params.status);
  const status = orderStatusValues.includes(rawStatus as AdminOrderStatus)
    ? (rawStatus as AdminOrderStatus)
    : '';
  const requestedPage = Number(getText(params.page)) || 1;
  const context = await requireAdminPage();
  const orders = await new SupabaseAdminRepository(context.client).listOrders(
    q,
    status,
    requestedPage,
  );
  const hrefForPage = (page: number) =>
    '/admin/orders?q=' + encodeURIComponent(q) + '&status=' + status + '&page=' + page;

  return (
    <div className="space-y-7">
      <AdminPageHeader
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Orders' }]}
        description="Order snapshots remain immutable; only the database-enforced delivery workflow can change."
        title="Orders"
      />
      <form
        className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4"
        role="search"
      >
        <label className="sr-only" htmlFor="order-search">
          Search orders
        </label>
        <input
          className="h-10 min-w-[16rem] flex-1 rounded-md border border-input bg-background px-3 text-sm"
          defaultValue={q}
          id="order-search"
          name="q"
          placeholder="Order number or customer email"
        />
        <label className="sr-only" htmlFor="order-status-filter">
          Order status
        </label>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          defaultValue={status}
          id="order-status-filter"
          name="status"
        >
          <option value="">All statuses</option>
          {orderStatusValues.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>
      <AdminTable
        emptyDescription="Try clearing the current search or status filter."
        emptyTitle="No orders found"
        headers={['Order', 'Customer', 'Total', 'Status', 'Created']}
      >
        {orders.rows.length
          ? orders.rows.map((order) => (
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
      <AdminPagination
        hasNextPage={orders.hasNextPage}
        hrefForPage={hrefForPage}
        page={orders.page}
        totalCount={orders.totalCount}
      />
    </div>
  );
}
