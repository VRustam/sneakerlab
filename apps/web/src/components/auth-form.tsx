'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { AuthFormShell } from '@/components/auth-form-shell';
import { FormFieldError } from '@/components/form-field-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createAuthService, type AuthService } from '@/lib/auth/service';
import { loginSchema, passwordResetSchema, registrationSchema } from '@/lib/auth/validation';

export type AuthFormMode = 'login' | 'register' | 'forgot-password';

interface AuthFormValues {
  fullName?: string;
  email: string;
  password?: string;
}

interface AuthFormProps {
  mode: AuthFormMode;
  authService?: AuthService;
}

const copy = {
  login: {
    title: 'Welcome back',
    description: 'Sign in to access your SneakerLab account.',
    submit: 'Sign in',
    success: 'You are signed in. Your session is ready.',
  },
  register: {
    title: 'Create your account',
    description: 'Save favorites and get ready for demo checkout.',
    submit: 'Create account',
    success: 'Account request received. Check your email if confirmation is enabled.',
  },
  'forgot-password': {
    title: 'Reset your password',
    description: 'We will send reset instructions if the address can be used for this project.',
    submit: 'Send reset instructions',
    success: 'If the address is eligible, reset instructions are on the way.',
  },
} as const;

function schemaFor(mode: AuthFormMode) {
  if (mode === 'register') return registrationSchema;
  if (mode === 'forgot-password') return passwordResetSchema;
  return loginSchema;
}

export function AuthForm({ mode, authService }: AuthFormProps) {
  const service = useMemo(() => authService ?? createAuthService(), [authService]);
  const [submissionError, setSubmissionError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const { formState, handleSubmit, register } = useForm<AuthFormValues>({
    defaultValues: { fullName: '', email: '', password: '' },
    resolver: zodResolver(schemaFor(mode)) as Resolver<AuthFormValues>,
  });
  const labels = copy[mode];

  async function onSubmit(values: AuthFormValues) {
    setSubmissionError(undefined);
    setSuccessMessage(undefined);
    const result =
      mode === 'register'
        ? await service.register({
            fullName: values.fullName ?? '',
            email: values.email,
            password: values.password ?? '',
          })
        : mode === 'login'
          ? await service.login({ email: values.email, password: values.password ?? '' })
          : await service.requestPasswordReset({ email: values.email });

    if (result.error) {
      setSubmissionError('We could not complete that request. Check your details and try again.');
      return;
    }
    setSuccessMessage(labels.success);
  }

  const { errors, isSubmitting } = formState;

  return (
    <AuthFormShell description={labels.description} title={labels.title}>
      <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
        {mode === 'register' ? (
          <div>
            <label className="text-sm font-medium" htmlFor="fullName">
              Full name
            </label>
            <Input
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              autoComplete="name"
              id="fullName"
              {...register('fullName')}
            />
            <FormFieldError id="fullName-error" message={errors.fullName?.message} />
          </div>
        ) : null}
        <div>
          <label className="text-sm font-medium" htmlFor="email">
            Email address
          </label>
          <Input
            aria-describedby={errors.email ? 'email-error' : undefined}
            autoComplete="email"
            id="email"
            inputMode="email"
            type="email"
            {...register('email')}
          />
          <FormFieldError id="email-error" message={errors.email?.message} />
        </div>
        {mode !== 'forgot-password' ? (
          <div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              {mode === 'login' ? (
                <Link
                  className="text-sm font-medium text-primary hover:underline"
                  href="/forgot-password"
                >
                  Forgot password?
                </Link>
              ) : null}
            </div>
            <Input
              aria-describedby={errors.password ? 'password-error' : undefined}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              id="password"
              type="password"
              {...register('password')}
            />
            <FormFieldError id="password-error" message={errors.password?.message} />
          </div>
        ) : null}
        {submissionError ? (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {submissionError}
          </p>
        ) : null}
        {successMessage ? (
          <p className="rounded-md bg-primary/10 p-3 text-sm text-foreground" role="status">
            {successMessage}
          </p>
        ) : null}
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Working…' : labels.submit}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        {mode === 'login' ? (
          <>
            Need an account?{' '}
            <Link className="font-medium text-primary hover:underline" href="/register">
              Register
            </Link>
          </>
        ) : mode === 'register' ? (
          <>
            Already registered?{' '}
            <Link className="font-medium text-primary hover:underline" href="/login">
              Sign in
            </Link>
          </>
        ) : (
          <>
            Remembered it?{' '}
            <Link className="font-medium text-primary hover:underline" href="/login">
              Return to sign in
            </Link>
          </>
        )}
      </p>
    </AuthFormShell>
  );
}
