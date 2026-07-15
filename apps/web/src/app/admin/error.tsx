'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="rounded-xl border border-destructive/30 bg-destructive/10 p-6" role="alert">
      <h1 className="text-xl font-bold">Admin data is temporarily unavailable</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        No private data has been displayed. Try loading the protected view again.
      </p>
      <Button className="mt-5" onClick={reset}>
        Try again
      </Button>
    </section>
  );
}
