import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRouteDecision } from '@/lib/auth/authorization';
import { getServerAuthIdentity } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin' };

export default async function AdminPage() {
  const decision = getRouteDecision('admin', await getServerAuthIdentity());
  if (!decision.allowed) redirect(decision.redirectTo);

  return (
    <PageContainer className="space-y-10 py-12 sm:py-16">
      <PageHeader
        eyebrow="Admin"
        title="Commerce administration"
        description="The role-protected management dashboard is scheduled for Phase 5."
      />
      <Card>
        <CardHeader>
          <CardTitle>Protected placeholder</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Server-side authorization and a typed role boundary are in place. Database-backed
            policies arrive with the Phase 2 profiles table.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
