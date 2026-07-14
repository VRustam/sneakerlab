'use client';

import { useState, useTransition } from 'react';
import { updateProfileAction } from '@/app/actions/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProfileFormProps {
  fullName: string;
  email: string;
}

export function ProfileForm({ fullName, email }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string>();

  function submit(formData: FormData) {
    setStatus(undefined);
    startTransition(async () => {
      const result = await updateProfileAction(formData);
      setStatus(result.error ?? result.success);
    });
  }

  return (
    <form action={submit} className="space-y-5">
      <div>
        <label className="text-sm font-semibold" htmlFor="profile-full-name">
          Full name
        </label>
        <Input defaultValue={fullName} id="profile-full-name" name="fullName" required />
      </div>
      <div>
        <label className="text-sm font-semibold" htmlFor="profile-email">
          Email address
        </label>
        <Input disabled id="profile-email" value={email} />
        <p className="mt-1 text-sm text-muted-foreground">
          Email is managed by your authentication provider.
        </p>
      </div>
      <Button disabled={isPending} type="submit">
        {isPending ? 'Saving…' : 'Save profile'}
      </Button>
      {status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}
    </form>
  );
}
