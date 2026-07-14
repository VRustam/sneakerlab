import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/logout-button';
import { AvatarUpload } from '@/components/avatar-upload';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { ProfileForm } from '@/components/profile-form';
import { ErrorState } from '@/components/states';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCommerceSession } from '@/lib/commerce/commerce-server';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your account' };

export default async function AccountPage() {
  const { repository, user } = await getCommerceSession();
  if (!user) redirect('/login?next=%2Faccount');
  if (!repository) {
    return (
      <PageContainer className="py-12">
        <ErrorState title="Account connection is not configured" />
      </PageContainer>
    );
  }

  let profile;
  let avatarUrl: string | null = null;
  try {
    profile = await repository.getProfile(user.id);
    avatarUrl = profile.avatarUrl ? await repository.getAvatarUrl(profile.avatarUrl) : null;
  } catch (error) {
    console.error('Account failed to load', error);
    return (
      <PageContainer className="py-12">
        <ErrorState title="Account temporarily unavailable" />
      </PageContainer>
    );
  }

  const initials = (profile.fullName ?? user.email ?? 'S')
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <PageContainer className="space-y-10 py-12 sm:py-16">
      <PageHeader
        eyebrow="Account"
        title="Your SneakerLab account"
        description="Manage the customer details used for secure demo checkout and revisit your saved pairs."
      />
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="relative flex size-12 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {avatarUrl ? (
                  <Image
                    alt="Your account avatar"
                    className="object-cover"
                    fill
                    sizes="48px"
                    src={avatarUrl}
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Avatar uploads are restricted to your private owner-only storage path.
                </p>
                <AvatarUpload userId={user.id} />
              </div>
            </div>
            <ProfileForm email={user.email ?? ''} fullName={profile.fullName ?? ''} />
          </CardContent>
        </Card>
        <aside className="space-y-5 rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
          <div>
            <h2 className="font-bold">Quick links</h2>
            <nav
              aria-label="Account links"
              className="mt-3 grid gap-2 text-sm font-semibold text-primary"
            >
              <Link className="hover:underline" href="/favorites">
                Favorites
              </Link>
              <Link className="hover:underline" href="/cart">
                Cart
              </Link>
              <Link className="hover:underline" href="/orders">
                Orders
              </Link>
            </nav>
          </div>
          <LogoutButton />
        </aside>
      </div>
    </PageContainer>
  );
}
