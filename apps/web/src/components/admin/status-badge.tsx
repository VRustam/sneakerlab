import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
}

const statusClassNames: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  processing: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  shipped: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  delivered: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  cancelled: 'bg-destructive/15 text-destructive',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize',
        statusClassNames[status] ?? 'bg-muted text-muted-foreground',
      )}
    >
      {status}
    </span>
  );
}
