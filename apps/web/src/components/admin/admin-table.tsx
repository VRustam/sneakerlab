import Link from 'next/link';
import type { ReactNode } from 'react';
import { EmptyState } from '@/components/states';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminTableProps {
  headers: string[];
  children: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: ReactNode;
}

export function AdminTable({
  headers,
  children,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: AdminTableProps) {
  const hasRows = Boolean(children);
  if (!hasRows) {
    return <EmptyState action={emptyAction} description={emptyDescription} title={emptyTitle} />;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[44rem] text-left text-sm">
        <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          <tr>
            {headers.map((header) => (
              <th className="px-4 py-3" key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

interface AdminPaginationProps {
  hrefForPage: (page: number) => string;
  page: number;
  hasNextPage: boolean;
  totalCount: number;
}

export function AdminPagination({
  hrefForPage,
  page,
  hasNextPage,
  totalCount,
}: AdminPaginationProps) {
  if (totalCount === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <p>
        {totalCount} total record{totalCount === 1 ? '' : 's'}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            href={hrefForPage(page - 1)}
          >
            Previous
          </Link>
        ) : (
          <Button disabled size="sm" variant="outline">
            Previous
          </Button>
        )}
        {hasNextPage ? (
          <Link
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            href={hrefForPage(page + 1)}
          >
            Next
          </Link>
        ) : (
          <Button disabled size="sm" variant="outline">
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
