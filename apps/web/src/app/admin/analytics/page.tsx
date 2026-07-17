import { BarChart3, TrendingUp, Package, ShoppingBag } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { RevenueChart } from '@/components/admin/revenue-chart';
import { CategoryBreakdown } from '@/components/admin/category-breakdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminTable } from '@/components/admin/admin-table';
import { formatPrice } from '@/lib/catalog/catalog-format';
import { SupabaseAdminRepository } from '@/lib/admin/repository';
import { requireAdminPage } from '@/lib/admin/server';

export const metadata = { title: 'Analytics — Admin' };

export default async function AnalyticsPage() {
  const context = await requireAdminPage();
  const repo = new SupabaseAdminRepository(context.client);
  const analytics = await repo.getAnalytics();

  const summaryCards = [
    {
      label: 'Total Revenue',
      value: formatPrice(analytics.totalRevenue),
      icon: TrendingUp,
    },
    {
      label: 'Total Orders',
      value: String(analytics.totalOrders),
      icon: ShoppingBag,
    },
    {
      label: 'Avg Order Value',
      value: formatPrice(analytics.avgOrderValue),
      icon: BarChart3,
    },
    {
      label: 'Products Sold',
      value: String(analytics.totalProductsSold),
      icon: Package,
    },
  ];

  return (
    <div className="space-y-7">
      <AdminPageHeader
        description="Revenue trends, category performance, and top-selling products."
        title="Analytics"
      />

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{label}</CardTitle>
              <Icon className="size-4 text-primary" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
          <p className="text-sm text-muted-foreground">Daily revenue for the last 30 days.</p>
        </CardHeader>
        <CardContent>
          <RevenueChart data={analytics.revenueByDay} />
        </CardContent>
      </Card>

      {/* Category breakdown + Top products */}
      <div className="grid gap-7 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
            <p className="text-sm text-muted-foreground">
              Breakdown of revenue across product categories.
            </p>
          </CardHeader>
          <CardContent>
            <CategoryBreakdown data={analytics.revenueByCategory} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <p className="text-sm text-muted-foreground">Best performers by total revenue.</p>
          </CardHeader>
          <CardContent>
            <AdminTable
              emptyDescription="Sales data will appear here once orders are placed."
              emptyTitle="No sales data"
              headers={['Product', 'Sold', 'Revenue']}
            >
              {analytics.topProducts.map((product) => (
                <tr key={product.name}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{product.name}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">{product.quantity}</td>
                  <td className="px-4 py-3 font-mono text-sm">{formatPrice(product.revenue)}</td>
                </tr>
              ))}
            </AdminTable>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
