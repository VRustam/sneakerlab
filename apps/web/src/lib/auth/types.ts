import type { UserRole } from '@sneakerlab/shared-types';

export interface AuthUser {
  id: string;
  email: string | null;
}

export interface AuthResult {
  error?: string;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface PasswordResetInput {
  email: string;
}

export interface AuthRepository {
  register(input: RegisterInput): Promise<AuthResult>;
  login(input: LoginInput): Promise<AuthResult>;
  requestPasswordReset(input: PasswordResetInput): Promise<AuthResult>;
  logout(): Promise<AuthResult>;
  getCurrentUser(): Promise<AuthUser | null>;
}

export interface AuthIdentity {
  kind: 'anonymous' | 'authenticated';
  role?: UserRole;
}
