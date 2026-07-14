import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import type {
  AuthRepository,
  AuthResult,
  AuthUser,
  LoginInput,
  PasswordResetInput,
  RegisterInput,
} from '@/lib/auth/types';

const unavailableMessage =
  'Authentication is not configured yet. Please try again after the project environment is set up.';
const safeAuthError = 'We could not complete that request. Check your details and try again.';

function errorResult(error: { message?: string } | null): AuthResult {
  return error ? { error: safeAuthError } : {};
}

export class SupabaseAuthRepository implements AuthRepository {
  async register(input: RegisterInput): Promise<AuthResult> {
    const client = getSupabaseBrowserClient();
    if (!client) return { error: unavailableMessage };

    const { error } = await client.auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: { full_name: input.fullName } },
    });
    return errorResult(error);
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const client = getSupabaseBrowserClient();
    if (!client) return { error: unavailableMessage };

    const { error } = await client.auth.signInWithPassword(input);
    return errorResult(error);
  }

  async requestPasswordReset(input: PasswordResetInput): Promise<AuthResult> {
    const client = getSupabaseBrowserClient();
    if (!client) return { error: unavailableMessage };

    const redirectTo =
      typeof window === 'undefined' ? undefined : `${window.location.origin}/login`;
    const { error } = await client.auth.resetPasswordForEmail(input.email, { redirectTo });
    return errorResult(error);
  }

  async logout(): Promise<AuthResult> {
    const client = getSupabaseBrowserClient();
    if (!client) return { error: unavailableMessage };

    const { error } = await client.auth.signOut();
    return errorResult(error);
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const client = getSupabaseBrowserClient();
    if (!client) return null;

    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return null;
    return { id: data.user.id, email: data.user.email ?? null };
  }
}
