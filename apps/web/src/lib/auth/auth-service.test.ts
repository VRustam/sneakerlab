import { vi } from 'vitest';
import { createAuthService } from '@/lib/auth/service';
import type { AuthRepository } from '@/lib/auth/types';

describe('createAuthService', () => {
  it('delegates to an injected repository for deterministic tests', async () => {
    const repository: AuthRepository = {
      register: vi.fn().mockResolvedValue({}),
      login: vi.fn().mockResolvedValue({}),
      requestPasswordReset: vi.fn().mockResolvedValue({}),
      logout: vi.fn().mockResolvedValue({}),
      getCurrentUser: vi
        .fn()
        .mockResolvedValue({ id: 'customer-1', email: 'customer@example.com' }),
    };
    const service = createAuthService(repository);

    await service.login({ email: 'customer@example.com', password: 'password-123' });

    expect(repository.login).toHaveBeenCalledWith({
      email: 'customer@example.com',
      password: 'password-123',
    });
  });
});
