'use client';

import { Pencil, Plus } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveCategoryAction } from '@/app/actions/admin';
import { AdminFormError } from '@/components/admin/admin-form-error';
import { StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AdminCategory } from '@/lib/admin/types';
import { slugify } from '@/lib/admin/validation';

interface CategoryManagerProps {
  categories: AdminCategory[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(18rem,25rem)_minmax(0,1fr)]">
      <CategoryForm
        key={editing?.id ?? 'new'}
        category={editing}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          router.refresh();
        }}
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[38rem] text-left text-sm">
          <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-[0.1em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-4 py-4 font-semibold">{category.name}</td>
                <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                  {category.slug}
                </td>
                <td className="px-4 py-4">{category.productCount}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={category.is_active ? 'active' : 'inactive'} />
                </td>
                <td className="px-4 py-4">
                  <Button onClick={() => setEditing(category)} size="sm" variant="outline">
                    <Pencil className="size-3.5" aria-hidden="true" />
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface CategoryFormProps {
  category: AdminCategory | null;
  onCancel: () => void;
  onSaved: () => void;
}

function CategoryForm({ category, onCancel, onSaved }: CategoryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(category?.name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [slugEdited, setSlugEdited] = useState(Boolean(category));
  const [error, setError] = useState<string>();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveCategoryAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved();
    });
  }

  return (
    <form
      className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6"
      noValidate
      onSubmit={submit}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{category ? 'Edit category' : 'New category'}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Deactivate categories instead of deleting records with products.
          </p>
        </div>
        {!category ? <Plus className="size-5 text-primary" aria-hidden="true" /> : null}
      </div>
      <AdminFormError message={error} />
      <input name="id" type="hidden" value={category?.id ?? ''} />
      <label className="block space-y-2 text-sm font-semibold">
        Name
        <Input
          name="name"
          onChange={(event) => {
            setName(event.target.value);
            if (!slugEdited) setSlug(slugify(event.target.value));
          }}
          required
          value={name}
        />
      </label>
      <label className="block space-y-2 text-sm font-semibold">
        Slug
        <Input
          name="slug"
          onChange={(event) => {
            setSlugEdited(true);
            setSlug(event.target.value);
          }}
          required
          value={slug}
        />
      </label>
      <label className="block space-y-2 text-sm font-semibold">
        Description
        <textarea
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          defaultValue={category?.description ?? ''}
          maxLength={1_000}
          name="description"
        />
      </label>
      <label className="block space-y-2 text-sm font-semibold">
        Image URL
        <Input defaultValue={category?.image_url ?? ''} name="imageUrl" type="url" />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input defaultChecked={category?.is_active ?? true} name="isActive" type="checkbox" />
        Active in public navigation
      </label>
      <div className="flex justify-end gap-3">
        {category ? (
          <Button onClick={onCancel} type="button" variant="outline">
            Cancel
          </Button>
        ) : null}
        <Button disabled={isPending} type="submit">
          {isPending ? 'Saving…' : category ? 'Save category' : 'Create category'}
        </Button>
      </div>
    </form>
  );
}
