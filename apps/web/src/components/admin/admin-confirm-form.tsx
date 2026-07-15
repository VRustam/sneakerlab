'use client';

import { useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';

interface AdminConfirmFormProps {
  action: (formData: FormData) => Promise<unknown>;
  fields: Record<string, string>;
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirmed?: (result: unknown) => Promise<void> | void;
}

export function AdminConfirmForm({
  action,
  fields,
  triggerLabel,
  title,
  description,
  confirmLabel,
  destructive = false,
  onConfirmed,
}: AdminConfirmFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function openDialog() {
    setError(undefined);
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function submit() {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => formData.set(key, value));
      const result = (await action(formData)) as { error?: string } | undefined;
      if (result?.error) {
        setError(result.error);
        return;
      }
      await onConfirmed?.(result);
      closeDialog();
    });
  }

  return (
    <>
      <Button onClick={openDialog} size="sm" variant={destructive ? 'destructive' : 'outline'}>
        {triggerLabel}
      </Button>
      <dialog
        className="w-[min(30rem,calc(100%-2rem))] rounded-xl border border-border bg-card p-0 text-card-foreground shadow-xl backdrop:bg-black/50"
        ref={dialogRef}
      >
        <div className="space-y-4 p-6">
          <div>
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {error ? (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-3">
            <Button disabled={isPending} onClick={closeDialog} variant="outline">
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={submit}
              variant={destructive ? 'destructive' : 'default'}
            >
              {isPending ? 'Working…' : confirmLabel}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
