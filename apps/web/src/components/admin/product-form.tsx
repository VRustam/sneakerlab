'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveProductAction } from '@/app/actions/admin';
import { AdminFormError } from '@/components/admin/admin-form-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AdminProduct } from '@/lib/admin/types';
import { slugify } from '@/lib/admin/validation';

interface ProductFormProps {
  product?: AdminProduct;
  categories: Array<{ id: string; name: string }>;
}

interface VariantDraft {
  key: string;
  id?: string;
  colorName: string;
  colorHex: string;
  size: string;
  stock: string;
  sku: string;
}

function createVariant(key: string): VariantDraft {
  return {
    key,
    colorName: '',
    colorHex: '',
    size: '',
    stock: '0',
    sku: '',
  };
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [isSlugEdited, setIsSlugEdited] = useState(Boolean(product));
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [variants, setVariants] = useState<VariantDraft[]>(
    product?.variants.map((variant) => ({
      key: variant.id,
      id: variant.id,
      colorName: variant.color_name,
      colorHex: variant.color_hex ?? '',
      size: variant.size,
      stock: String(variant.stock),
      sku: variant.sku,
    })) ?? [],
  );
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();

  function updateVariant(key: string, values: Partial<VariantDraft>) {
    setVariants((current) =>
      current.map((variant) => (variant.key === key ? { ...variant, ...values } : variant)),
    );
  }

  function addVariant() {
    const key = typeof crypto !== 'undefined' ? crypto.randomUUID() : String(Date.now());
    setVariants((current) => [...current, createVariant(key)]);
  }

  function removeVariant(key: string) {
    setVariants((current) => current.filter((variant) => variant.key !== key));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setSuccess(undefined);
    const formData = new FormData(event.currentTarget);
    formData.set(
      'variants',
      JSON.stringify(
        variants.map(({ id, colorName, colorHex, size, stock: variantStock, sku }) => ({
          ...(id ? { id } : {}),
          colorName,
          colorHex,
          size,
          stock: Number(variantStock),
          sku,
        })),
      ),
    );
    startTransition(async () => {
      const result = await saveProductAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(result.success);
      if (result.redirectTo) {
        router.push(result.redirectTo);
        return;
      }
      router.refresh();
    });
  }

  const hasVariants = variants.length > 0;
  return (
    <form className="space-y-7" noValidate onSubmit={submit}>
      <AdminFormError message={error} />
      {success ? (
        <p className="rounded-lg bg-primary/10 p-4 text-sm font-medium" role="status">
          {success}
        </p>
      ) : null}
      <input name="id" type="hidden" value={product?.id ?? ''} />
      <section className="grid gap-5 rounded-xl border border-border bg-card p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-bold">Product details</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Public copy, category, pricing, and catalog state.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Product name" required>
            <Input
              id="product-name"
              name="name"
              onChange={(event) => {
                const nextName = event.target.value;
                setName(nextName);
                if (!isSlugEdited) setSlug(slugify(nextName));
              }}
              required
              value={name}
            />
          </Field>
          <Field label="Slug" required hint="Lowercase URL; it is normalized before saving.">
            <Input
              id="product-slug"
              name="slug"
              onChange={(event) => {
                setIsSlugEdited(true);
                setSlug(event.target.value);
              }}
              required
              value={slug}
            />
          </Field>
          <Field label="Category">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue={product?.category_id ?? ''}
              id="product-category"
              name="categoryId"
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Short description" hint="Shown on product cards (maximum 240 characters).">
            <Input
              defaultValue={product?.short_description ?? ''}
              id="product-short-description"
              maxLength={240}
              name="shortDescription"
            />
          </Field>
          <Field label="Price" required>
            <Input
              defaultValue={product?.price ?? 0}
              id="product-price"
              min="0"
              name="price"
              required
              step="0.01"
              type="number"
            />
          </Field>
          <Field label="Compare-at price" hint="Optional. Must not be below the selling price.">
            <Input
              defaultValue={product?.compare_at_price ?? ''}
              id="product-compare-at-price"
              min="0"
              name="compareAtPrice"
              step="0.01"
              type="number"
            />
          </Field>
          <Field className="sm:col-span-2" label="Description">
            <textarea
              className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue={product?.description ?? ''}
              id="product-description"
              maxLength={8_000}
              name="description"
            />
          </Field>
          <Field
            className="sm:col-span-2"
            label="Default image URL"
            hint="Use the uploader after creating a product for a protected Storage path."
          >
            <Input
              defaultValue={product?.image_url ?? ''}
              id="product-image-url"
              name="imageUrl"
              type="url"
            />
          </Field>
          <Field
            className="sm:col-span-2"
            label="3D model URL"
            hint="Use the model uploader after creation for a protected Storage path."
          >
            <Input
              defaultValue={product?.model_3d_url ?? ''}
              id="product-model-url"
              name="modelUrl"
              type="url"
            />
          </Field>
          <Field
            label="Default stock"
            hint={
              hasVariants
                ? 'Variant stock is used while variants exist.'
                : 'Used for products without variants.'
            }
          >
            <input name="stock" type="hidden" value={stock} />
            <Input
              aria-describedby={hasVariants ? 'product-stock-help' : undefined}
              disabled={hasVariants}
              id="product-stock"
              min="0"
              onChange={(event) => setStock(event.target.value)}
              step="1"
              type="number"
              value={stock}
            />
          </Field>
          <div className="flex flex-wrap items-end gap-5 pb-2">
            <label className="flex min-h-10 items-center gap-2 text-sm font-semibold">
              <input
                defaultChecked={product?.is_featured ?? false}
                name="isFeatured"
                type="checkbox"
              />
              Featured product
            </label>
            <label className="flex min-h-10 items-center gap-2 text-sm font-semibold">
              <input defaultChecked={product?.is_active ?? true} name="isActive" type="checkbox" />
              Active in public catalog
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Variants</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Color, size, SKU, and stock are validated as one product change.
            </p>
          </div>
          <Button onClick={addVariant} type="button" variant="outline">
            <Plus className="size-4" aria-hidden="true" />
            Add variant
          </Button>
        </div>
        {variants.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            No variants yet. Default stock will be used.
          </p>
        ) : (
          <div className="space-y-4">
            {variants.map((variant, index) => (
              <fieldset
                className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[1fr_8rem_7rem_7rem_1fr_auto]"
                key={variant.key}
              >
                <legend className="px-1 text-sm font-bold">Variant {index + 1}</legend>
                <Field label="Color">
                  <Input
                    onChange={(event) =>
                      updateVariant(variant.key, { colorName: event.target.value })
                    }
                    value={variant.colorName}
                  />
                </Field>
                <Field label="Hex">
                  <Input
                    onChange={(event) =>
                      updateVariant(variant.key, { colorHex: event.target.value })
                    }
                    placeholder="#000000"
                    value={variant.colorHex}
                  />
                </Field>
                <Field label="Size">
                  <Input
                    onChange={(event) => updateVariant(variant.key, { size: event.target.value })}
                    value={variant.size}
                  />
                </Field>
                <Field label="Stock">
                  <Input
                    min="0"
                    onChange={(event) => updateVariant(variant.key, { stock: event.target.value })}
                    type="number"
                    value={variant.stock}
                  />
                </Field>
                <Field label="SKU">
                  <Input
                    onChange={(event) => updateVariant(variant.key, { sku: event.target.value })}
                    value={variant.sku}
                  />
                </Field>
                <Button
                  aria-label={'Remove variant ' + (index + 1)}
                  className="self-end"
                  onClick={() => removeVariant(variant.key)}
                  size="icon"
                  type="button"
                  variant="destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </fieldset>
            ))}
          </div>
        )}
      </section>

      <div className="flex justify-end">
        <Button disabled={isPending} size="lg" type="submit">
          {isPending ? 'Saving…' : product ? 'Save product' : 'Create product'}
        </Button>
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
  className?: string;
}

function Field({ label, children, hint, required, className }: FieldProps) {
  return (
    <label className={'block space-y-2 ' + (className ?? '')}>
      <span className="text-sm font-semibold">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      {children}
      {hint ? <span className="block text-xs leading-5 text-muted-foreground">{hint}</span> : null}
    </label>
  );
}
