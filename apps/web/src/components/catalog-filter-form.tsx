import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DEFAULT_CATALOG_FILTERS, getCatalogHref } from '@/lib/catalog/catalog-filters';
import type { CatalogFacets, CatalogFilters } from '@/lib/catalog/types';

interface CatalogFilterFormProps {
  actionPath: string;
  facets: CatalogFacets;
  filters: CatalogFilters;
  lockedCategory?: string;
}

const selectClassName =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

export function CatalogFilterForm({
  actionPath,
  facets,
  filters,
  lockedCategory,
}: CatalogFilterFormProps) {
  const clearPath = getCatalogHref(
    { ...DEFAULT_CATALOG_FILTERS, ...(lockedCategory ? { category: lockedCategory } : {}) },
    actionPath,
  );

  return (
    <form
      action={actionPath}
      className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:block lg:space-y-4 lg:p-5"
    >
      <div className="sm:col-span-2 lg:col-span-1">
        <label className="mb-2 block text-sm font-semibold" htmlFor="catalog-search">
          Search
        </label>
        <Input
          defaultValue={filters.query}
          id="catalog-search"
          name="q"
          placeholder="Search sneakers"
        />
      </div>
      {lockedCategory ? (
        <input name="category" type="hidden" value={lockedCategory} />
      ) : (
        <label className="block text-sm font-semibold">
          Category
          <select
            className={`${selectClassName} mt-2`}
            defaultValue={filters.category}
            name="category"
          >
            <option value="">All categories</option>
            {facets.categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="block text-sm font-semibold">
        Size
        <select className={`${selectClassName} mt-2`} defaultValue={filters.size} name="size">
          <option value="">All sizes</option>
          {facets.sizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-semibold">
        Color
        <select className={`${selectClassName} mt-2`} defaultValue={filters.color} name="color">
          <option value="">All colors</option>
          {facets.colors.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-semibold">
          Min price
          <Input defaultValue={filters.minPrice} min="0" name="min" placeholder="0" type="number" />
        </label>
        <label className="block text-sm font-semibold">
          Max price
          <Input
            defaultValue={filters.maxPrice}
            min="0"
            name="max"
            placeholder="200"
            type="number"
          />
        </label>
      </div>
      <label className="block text-sm font-semibold">
        Sort
        <select className={`${selectClassName} mt-2`} defaultValue={filters.sort} name="sort">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </label>
      <label className="flex min-h-10 items-center gap-2 text-sm font-semibold">
        <input defaultChecked={filters.featured} name="featured" type="checkbox" value="1" />
        Featured only
      </label>
      <div className="flex gap-3 sm:col-span-2 lg:col-span-1">
        <Button className="flex-1" type="submit">
          Apply filters
        </Button>
        <Link className={buttonVariants({ variant: 'outline' })} href={clearPath}>
          Clear
        </Link>
      </div>
    </form>
  );
}
