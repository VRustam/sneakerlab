'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  short_description: string | null;
  category_name: string | null;
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) {
        setQuery('');
        setResults([]);
        setActiveIndex(-1);
      }
      return !prev;
    });
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, toggle]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Debounced search
  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      setActiveIndex(-1);
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (value.trim().length < 2) {
        setResults([]);
        return;
      }

      debounceRef.current = setTimeout(() => {
        startTransition(async () => {
          try {
            const response = await fetch(
              '/api/search?' + new URLSearchParams({ q: value.trim() }),
            );
            if (response.ok) {
              const data = await response.json();
              setResults(data.results ?? []);
            }
          } catch {
            // Silently ignore search errors
          }
        });
      }, 250);
    },
    [],
  );

  const navigateToResult = useCallback(
    (slug: string) => {
      setOpen(false);
      router.push('/products/' + slug);
    },
    [router],
  );

  const navigateToSearch = useCallback(() => {
    if (query.trim()) {
      setOpen(false);
      router.push('/products?q=' + encodeURIComponent(query.trim()));
    }
  }, [query, router]);

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        navigateToResult(results[activeIndex].slug);
      } else {
        navigateToSearch();
      }
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  }

  return (
    <>
      {/* Search trigger button */}
      <button
        aria-label="Search products"
        className="flex h-9 items-center gap-2 rounded-md border border-input bg-card/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={toggle}
        type="button"
      >
        <Search className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="ml-2 hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </button>

      {/* Backdrop + Dialog */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          role="presentation"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" aria-hidden="true" />

          {/* Dialog */}
          <div
            className="relative w-full max-w-lg animate-in fade-in slide-in-from-top-4 rounded-xl border border-border bg-card shadow-2xl shadow-black/40 duration-200"
            role="dialog"
            aria-label="Search products"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <Input
                ref={inputRef}
                className="h-12 border-0 bg-transparent px-0 text-base shadow-none ring-0 placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search sneakers..."
                type="search"
                value={query}
              />
              {isPending && <Loader2 className="size-4 shrink-0 animate-spin text-primary" />}
              <button
                aria-label="Close search"
                className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto p-2">
              {query.trim().length >= 2 && results.length === 0 && !isPending && (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No sneakers found for &ldquo;{query}&rdquo;
                </p>
              )}

              {results.length > 0 && (
                <ul role="listbox" aria-label="Search results">
                  {results.map((result, index) => (
                    <li key={result.id} role="option" aria-selected={index === activeIndex}>
                      <button
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                          index === activeIndex
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent/50',
                        )}
                        onClick={() => navigateToResult(result.slug)}
                        onMouseEnter={() => setActiveIndex(index)}
                        type="button"
                      >
                        {result.image_url && (
                          <img
                            alt={result.name}
                            className="size-10 shrink-0 rounded-md bg-muted object-cover"
                            src={result.image_url}
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{result.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {result.category_name && (
                              <span className="mr-2">{result.category_name}</span>
                            )}
                            {formatPrice(result.price)}
                          </p>
                        </div>
                        <ArrowRight
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* View all results link */}
              {query.trim().length >= 2 && results.length > 0 && (
                <button
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-accent/50"
                  onClick={navigateToSearch}
                  type="button"
                >
                  View all results for &ldquo;{query}&rdquo;
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Footer hint */}
            <div className="border-t border-border px-4 py-2">
              <p className="text-[11px] text-muted-foreground">
                <kbd className="mr-1 rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">↑↓</kbd>
                navigate
                <kbd className="mx-1 rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">↵</kbd>
                select
                <kbd className="mx-1 rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">esc</kbd>
                close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
