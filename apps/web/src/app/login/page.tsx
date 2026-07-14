import { AuthForm } from '@/components/auth-form';
import { PageContainer } from '@/components/page-container';

export const metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <PageContainer className="py-12 sm:py-20">
      <AuthForm mode="login" />
    </PageContainer>
  );
}
