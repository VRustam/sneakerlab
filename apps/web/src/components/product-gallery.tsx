import Image from 'next/image';
import { getProductImage } from '@/lib/catalog/catalog-format';
import type { CatalogProduct } from '@/lib/catalog/types';

interface ProductGalleryProps {
  product: CatalogProduct;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const fallback = getProductImage(product);
  const images =
    product.images.length > 0
      ? product.images.map((image) => ({
          src: image.image_url,
          alt: image.alt_text ?? `${product.name} sneaker`,
        }))
      : [fallback];

  return (
    <div className="grid gap-3 sm:grid-cols-2" aria-label={`${product.name} image gallery`}>
      {images.map((image, index) => (
        <div
          className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
          key={`${image.src}-${index}`}
        >
          <Image
            alt={image.alt}
            className="object-cover"
            fill
            priority={index === 0}
            sizes="(min-width: 1024px) 45vw, 100vw"
            src={image.src}
          />
        </div>
      ))}
    </div>
  );
}
