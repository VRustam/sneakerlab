export function CatalogSkeleton() {
  return (
    <div
      className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
      aria-label="Loading products"
      aria-live="polite"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div className="overflow-hidden rounded-xl border border-border bg-card" key={index}>
          <div className="aspect-square animate-pulse bg-muted" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
