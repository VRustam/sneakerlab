'use client';

import { type ChangeEvent, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateAvatarAction } from '@/app/actions/profile';
import { Button } from '@/components/ui/button';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

interface AvatarUploadProps {
  userId: string;
}

const allowedTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

export function AvatarUpload({ userId }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string>();

  function chooseFile() {
    inputRef.current?.click();
  }

  function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    const extension = allowedTypes.get(file.type);
    if (!extension || file.size > 2 * 1024 * 1024) {
      setStatus('Choose a JPEG, PNG, or WebP image under 2 MB.');
      return;
    }
    const client = getSupabaseBrowserClient();
    if (!client) {
      setStatus('Avatar uploads need public Supabase configuration.');
      return;
    }

    setStatus(undefined);
    startTransition(async () => {
      const path = `${userId}/avatar-${Date.now()}.${extension}`;
      const { error } = await client.storage.from('avatars').upload(path, file, {
        cacheControl: '3600',
        contentType: file.type,
      });
      if (error) {
        setStatus('We could not upload that avatar. Please try again.');
        return;
      }
      const result = await updateAvatarAction(path);
      setStatus(result.error ?? result.success);
      if (result.success) router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <input
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={upload}
        ref={inputRef}
        type="file"
      />
      <Button disabled={isPending} onClick={chooseFile} size="sm" type="button" variant="outline">
        {isPending ? 'Uploading…' : 'Upload avatar'}
      </Button>
      <p className="text-xs text-muted-foreground">
        JPEG, PNG, or WebP; maximum 2 MB. Your image stays in your private owner-only avatar path.
      </p>
      {status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
