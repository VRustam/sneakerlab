import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AuthForm } from '@/components/auth-form';
import type { AuthService } from '@/lib/auth/service';

function fakeService(overrides: Partial<AuthService> = {}): AuthService {
  return {
    register: vi.fn().mockResolvedValue({}),
    login: vi.fn().mockResolvedValue({}),
    requestPasswordReset: vi.fn().mockResolvedValue({}),
    logout: vi.fn().mockResolvedValue({}),
    getCurrentUser: vi.fn().mockResolvedValue(null),
    ...overrides,
  };
}

describe('AuthForm', () => {
  it('shows required validation for an empty login form', async () => {
    const user = userEvent.setup();
    render(<AuthForm authService={fakeService()} mode="login" />);

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Use at least 8 characters.')).toBeInTheDocument();
  });

  it('validates registration fields', async () => {
    const user = userEvent.setup();
    render(<AuthForm authService={fakeService()} mode="register" />);

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Enter your full name.')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
  });

  it('prevents a duplicate submission while a login is pending', async () => {
    const user = userEvent.setup();
    let resolveLogin: (() => void) | undefined;
    const login = vi.fn().mockImplementation(
      () =>
        new Promise<{ error?: string }>((resolve) => {
          resolveLogin = () => resolve({});
        }),
    );
    render(<AuthForm authService={fakeService({ login })} mode="login" />);

    await user.type(screen.getByLabelText('Email address'), 'sam@example.com');
    await user.type(screen.getByLabelText('Password'), 'correct-horse');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Working…' })).toBeDisabled());
    await user.click(screen.getByRole('button', { name: 'Working…' }));
    expect(login).toHaveBeenCalledTimes(1);

    resolveLogin?.();
    expect(
      await screen.findByText('You are signed in. Your session is ready.'),
    ).toBeInTheDocument();
  });

  it('renders a safe error instead of a repository error detail', async () => {
    const user = userEvent.setup();
    render(
      <AuthForm
        authService={fakeService({
          login: vi.fn().mockResolvedValue({ error: 'raw provider message: token=secret' }),
        })}
        mode="login"
      />,
    );

    await user.type(screen.getByLabelText('Email address'), 'sam@example.com');
    await user.type(screen.getByLabelText('Password'), 'correct-horse');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We could not complete that request.',
    );
    expect(screen.queryByText(/token=secret/)).not.toBeInTheDocument();
  });
});
