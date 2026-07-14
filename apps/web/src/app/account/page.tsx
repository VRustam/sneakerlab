import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/logout-button';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRouteDecision } from '@/lib/auth/authorization';
import { getServerAuthIdentity } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your account' };

export default async function AccountPage() {
  const decision = getRouteDecision('account', await getServerAuthIdentity());
  if (!decision.allowed) redirect(decision.redirectTo);

  return (
    <PageContainer className="space-y-10 py-12 sm:py-16">
      <PageHeader
        eyebrow="Account"
        title="Your SneakerLab account"
        description="Profile, favorites, cart, and order history are connected in later phases."
      />
      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your route is protected on the server. Profile data and role policies are added in Phase
            2.
          </p>
          <LogoutButton />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
