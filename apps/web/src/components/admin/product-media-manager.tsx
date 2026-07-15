'use client';

import Image from 'next/image';
import { ArrowDown, ArrowUp, FileBox, ImagePlus, Upload } from 'lucide-react';
import { type ChangeEvent, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  addProductImageAction,
  deleteProductImageAction,
  reorderProductImagesAction,
  setProductModelAction,
} from '@/app/actions/admin';
import { AdminConfirmForm } from '@/components/admin/admin-confirm-form';
import { Button } from '@/components/ui/button';
import type { AdminProduct } from '@/lib/admin/types';
import { buildMediaPath, validateMediaFile, type MediaKind } from '@/lib/admin/validation';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

interface ProductMediaManagerProps {
  product: AdminProduct;
}

export function ProductMediaManager({ product }: ProductMediaManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();

  async function uploadMedia(kind: MediaKind, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const validated = validateMediaFile(file, kind);
    if (!validated.success) {
      setError(validated.error);
      return;
    }
    const client = getSupabaseBrowserClient();
    if (!client) {
      setError('Storage is not configured for this browser.');
      return;
    }
    setError(undefined);
    setStatus('Uploading ' + file.name + '…');
    const bucket = kind === 'image' ? 'product-images' : 'product-models';
    const path = buildMediaPath(
      product.id,
      kind,
      file.name,
      typeof crypto !== 'undefined' ? crypto.randomUUID() : String(Date.now()),
    );
    const { error: uploadError } = await client.storage
      .from(bucket)
      .upload(path, file, { upsert: false });
    if (uploadError) {
      setStatus(undefined);
      setError('The file could not be uploaded. Check your admin session and try again.');
      return;
    }
    const { data } = client.storage.from(bucket).getPublicUrl(path);
    const formData = new FormData();
    formData.set('productId', product.id);
    if (kind === 'image') {
      formData.set('imageUrl', data.publicUrl);
      formData.set('altText', product.name + ' product image');
      const result = await addProductImageAction(formData);
      if (result.error) {
        await client.storage.from(bucket).remove([path]);
        setStatus(undefined);
        setError(result.error);
        return;
      }
    } else {
      formData.set('modelUrl', data.publicUrl);
      const result = await setProductModelAction(formData);
      if (result.error) {
        await client.storage.from(bucket).remove([path]);
        setStatus(undefined);
        setError(result.error);
        return;
      }
    }
    setStatus(kind === 'image' ? 'Image uploaded and linked.' : '3D model uploaded and linked.');
    router.refresh();
  }

  function moveImage(imageId: string, direction: -1 | 1) {
    const ids = product.images.map((image) => image.id);
    const from = ids.indexOf(imageId);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= ids.length) return;
    const fromId = ids[from];
    const toId = ids[to];
    if (!fromId || !toId) return;
    ids[from] = toId;
    ids[to] = fromId;
    const formData = new FormData();
    formData.set('productId', product.id);
    formData.set('imageIds', JSON.stringify(ids));
    setError(undefined);
    startTransition(async () => {
      const result = await reorderProductImagesAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setStatus('Image order saved.');
      router.refresh();
    });
  }

  async function removeUploadedImage(result: unknown) {
    const storagePath = (result as { storagePath?: string | null } | undefined)?.storagePath;
    if (storagePath) {
      const client = getSupabaseBrowserClient();
      if (client) await client.storage.from('product-images').remove([storagePath]);
    }
    router.refresh();
  }

  return (
    <section className="space-y-6 rounded-xl border border-border bg-card p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-bold">Product media</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Uploads use the signed-in admin session and Storage RLS. Images accept JPEG, PNG, or WebP
          up to 5 MB; models accept GLB/glTF up to 20 MB.
        </p>
      </div>
      {error ? (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {status ? (
        <p className="rounded-lg bg-primary/10 p-3 text-sm font-medium" role="status">
          {status}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center text-sm font-semibold hover:bg-muted/40">
          <ImagePlus className="size-5 text-primary" aria-hidden="true" />
          <span>Upload product image</span>
          <span className="text-xs font-normal text-muted-foreground">
            JPEG, PNG, WebP · maximum 5 MB
          </span>
          <input
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={isPending}
            onChange={(event) => void uploadMedia('image', event)}
            type="file"
          />
        </label>
        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center text-sm font-semibold hover:bg-muted/40">
          <FileBox className="size-5 text-primary" aria-hidden="true" />
          <span>Upload 3D model</span>
          <span className="text-xs font-normal text-muted-foreground">
            GLB or glTF · maximum 20 MB
          </span>
          <input
            accept=".glb,.gltf,model/gltf-binary,model/gltf+json,application/octet-stream"
            className="sr-only"
            disabled={isPending}
            onChange={(event) => void uploadMedia('model', event)}
            type="file"
          />
        </label>
      </div>

      {product.model_3d_url ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4 text-sm">
          <span className="font-semibold">3D model linked</span>
          <div className="flex gap-2">
            <a
              className="inline-flex min-h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold hover:bg-accent"
              href={product.model_3d_url}
              rel="noreferrer"
              target="_blank"
            >
              <Upload className="size-3.5" aria-hidden="true" />
              Preview file
            </a>
            <AdminConfirmForm
              action={setProductModelAction}
              confirmLabel="Remove model"
              description="The product will no longer reference this 3D model. The storage object remains available for a deliberate replacement or cleanup."
              fields={{ productId: product.id, modelUrl: '' }}
              title="Remove 3D model?"
              triggerLabel="Remove"
              destructive
            />
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {product.images.map((image, index) => (
          <article className="overflow-hidden rounded-lg border border-border" key={image.id}>
            <div className="relative aspect-square bg-muted">
              <Image
                alt={image.alt_text ?? product.name + ' product image'}
                className="object-cover"
                fill
                sizes="(min-width: 1280px) 20vw, (min-width: 640px) 45vw, 100vw"
                src={image.image_url}
              />
            </div>
            <div className="flex items-center justify-between gap-2 p-3">
              <p className="text-xs font-mono text-muted-foreground">Position {index + 1}</p>
              <div className="flex gap-1">
                <Button
                  aria-label={'Move image ' + (index + 1) + ' earlier'}
                  disabled={isPending || index === 0}
                  onClick={() => moveImage(image.id, -1)}
                  size="icon"
                  variant="outline"
                >
                  <ArrowUp className="size-3.5" aria-hidden="true" />
                </Button>
                <Button
                  aria-label={'Move image ' + (index + 1) + ' later'}
                  disabled={isPending || index === product.images.length - 1}
                  onClick={() => moveImage(image.id, 1)}
                  size="icon"
                  variant="outline"
                >
                  <ArrowDown className="size-3.5" aria-hidden="true" />
                </Button>
                <AdminConfirmForm
                  action={deleteProductImageAction}
                  confirmLabel="Remove image"
                  description="This removes the image from the product. Uploaded Storage files are deleted after the relation is removed."
                  fields={{ productId: product.id, imageId: image.id }}
                  onConfirmed={removeUploadedImage}
                  title="Remove product image?"
                  triggerLabel="Remove"
                  destructive
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
