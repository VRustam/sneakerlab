import { AuthForm } from '@/components/auth-form';
import { PageContainer } from '@/components/page-container';

export const metadata = { title: 'Reset password' };

export default function ForgotPasswordPage() {
  return (
    <PageContainer className="py-12 sm:py-20">
      <AuthForm mode="forgot-password" />
    </PageContainer>
  );
}
