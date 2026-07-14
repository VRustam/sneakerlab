'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createAuthService } from '@/lib/auth/service';

export function LogoutButton() {
  const [status, setStatus] = useState<string>();
  const [isPending, setIsPending] = useState(false);

  async function logout() {
    setIsPending(true);
    setStatus(undefined);
    const result = await createAuthService().logout();
    setIsPending(false);
    setStatus(result.error ?? 'You have been signed out.');
  }

  return (
    <div className="space-y-2">
      <Button disabled={isPending} onClick={logout} variant="outline">
        {isPending ? 'Signing out…' : 'Sign out'}
      </Button>
      {status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
