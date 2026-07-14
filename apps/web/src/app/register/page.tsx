import { AuthForm } from '@/components/auth-form';
import { PageContainer } from '@/components/page-container';

export const metadata = { title: 'Create account' };

export default function RegisterPage() {
  return (
    <PageContainer className="py-12 sm:py-20">
      <AuthForm mode="register" />
    </PageContainer>
  );
}
