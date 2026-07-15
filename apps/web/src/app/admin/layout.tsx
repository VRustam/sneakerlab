import type { ReactNode } from 'react';
import { AdminShellNavigation } from '@/components/admin/admin-shell';
import { requireAdminPage } from '@/lib/admin/server';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminPage();
  return (
    <div className="min-h-screen bg-background lg:flex">
      <AdminShellNavigation />
      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">{children}</div>
      </main>
    </div>
  );
}
