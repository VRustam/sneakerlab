import { SupabaseAuthRepository } from '@/lib/auth/repository';
import type {
  AuthRepository,
  LoginInput,
  PasswordResetInput,
  RegisterInput,
} from '@/lib/auth/types';

export function createAuthService(repository: AuthRepository = new SupabaseAuthRepository()) {
  return {
    register(input: RegisterInput) {
      return repository.register(input);
    },
    login(input: LoginInput) {
      return repository.login(input);
    },
    requestPasswordReset(input: PasswordResetInput) {
      return repository.requestPasswordReset(input);
    },
    logout() {
      return repository.logout();
    },
    getCurrentUser() {
      return repository.getCurrentUser();
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
