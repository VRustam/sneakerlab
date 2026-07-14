import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StateProps {
  title?: string;
  description?: string;
  className?: string;
  action?: ReactNode;
}

const stateClassName =
  'flex min-h-36 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center';

export function LoadingState({
  title = 'Loading',
  description = 'Please wait while we prepare this view.',
  className,
}: StateProps) {
  return (
    <div className={cn(stateClassName, className)} aria-live="polite">
      <LoaderCircle className="size-6 animate-spin text-primary" aria-hidden="true" />
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function EmptyState({
  title = 'Nothing here yet',
  description = 'Check back soon.',
  className,
  action,
}: StateProps) {
  return (
    <div className={cn(stateClassName, className)}>
      <Inbox className="size-6 text-muted-foreground" aria-hidden="true" />
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  className,
}: StateProps) {
  return (
    <div className={cn(stateClassName, className)} role="alert">
      <AlertCircle className="size-6 text-destructive" aria-hidden="true" />
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
