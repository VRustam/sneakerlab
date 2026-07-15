'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Box, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const ProductModelScene = dynamic(
  () => import('@/components/product-model-scene').then((module) => module.ProductModelScene),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex aspect-square items-center justify-center rounded-xl border border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground"
        role="status"
      >
        Loading interactive 3D preview…
      </div>
    ),
  },
);

interface ProductModelViewerProps {
  modelUrl: string | null;
  productName: string;
  fallbackImage: {
    src: string;
    alt: string;
  };
}

function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) return undefined;
    const updatePreference = () => setPrefersReducedMotion(media.matches);
    updatePreference();
    media.addEventListener('change', updatePreference);
    return () => media.removeEventListener('change', updatePreference);
  }, []);

  return prefersReducedMotion;
}

function ModelImageFallback({
  fallbackImage,
  productName,
  message,
}: Omit<ProductModelViewerProps, 'modelUrl'> & { message: string }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
      <Image
        alt={fallbackImage.alt}
        className="object-cover"
        fill
        sizes="(min-width: 1024px) 28rem, 100vw"
        src={fallbackImage.src}
      />
      <div className="absolute inset-x-3 bottom-3 rounded-lg bg-background/95 p-3 shadow-sm backdrop-blur">
        <div className="flex items-start gap-2">
          <Box aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-sm leading-5 text-foreground">
            <span className="font-semibold">{productName}: </span>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ProductModelViewer({
  modelUrl,
  productName,
  fallbackImage,
}: ProductModelViewerProps) {
  const prefersReducedMotion = useReducedMotion();
  const [motionEnabledFor, setMotionEnabledFor] = useState<string | null>(null);
  const [modelErrorFor, setModelErrorFor] = useState<string | null>(null);
  const [resetVersion, setResetVersion] = useState(0);

  const hasEnabledMotion = motionEnabledFor === modelUrl;
  const hasModelError = Boolean(modelUrl) && modelErrorFor === modelUrl;

  const shouldShowScene =
    Boolean(modelUrl) && !hasModelError && (!prefersReducedMotion || hasEnabledMotion);

  return (
    <section aria-label={`${productName} 3D preview`} className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">
            Interactive detail
          </p>
          <h2 className="mt-1 text-xl font-bold">3D product preview</h2>
        </div>
        {shouldShowScene ? (
          <Button
            onClick={() => setResetVersion((value) => value + 1)}
            size="sm"
            type="button"
            variant="outline"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Reset view
          </Button>
        ) : null}
      </div>

      {!modelUrl ? (
        <ModelImageFallback
          fallbackImage={fallbackImage}
          message="3D preview is unavailable for this product. The image gallery remains available."
          productName={productName}
        />
      ) : hasModelError ? (
        <ModelImageFallback
          fallbackImage={fallbackImage}
          message="The 3D file could not load, so the product image is shown instead."
          productName={productName}
        />
      ) : shouldShowScene ? (
        <ProductModelScene
          key={`${modelUrl}-${resetVersion}`}
          modelUrl={modelUrl}
          onError={() => setModelErrorFor(modelUrl)}
        />
      ) : (
        <div className="space-y-3">
          <ModelImageFallback
            fallbackImage={fallbackImage}
            message="Motion is paused to respect your reduced-motion preference."
            productName={productName}
          />
          <Button onClick={() => setMotionEnabledFor(modelUrl)} type="button" variant="outline">
            Enable interactive 3D preview
          </Button>
        </div>
      )}

      <p className="text-sm leading-6 text-muted-foreground">
        Drag to rotate, use the scroll wheel or pinch gesture to zoom, and use Reset view to return
        to the default angle. Product details and checkout controls remain available below.
      </p>
    </section>
  );
}
