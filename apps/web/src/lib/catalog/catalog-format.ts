import type { CatalogProduct } from '@/lib/catalog/types';

export function formatPrice(value: number, locale = 'en-US', currency = 'USD') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

export function getProductStock(product: Pick<CatalogProduct, 'stock' | 'variants'>) {
  if (product.variants.length === 0) return product.stock;
  return product.variants.reduce((total, variant) => total + variant.stock, 0);
}

export function getStockLabel(product: Pick<CatalogProduct, 'stock' | 'variants'>) {
  const stock = getProductStock(product);
  if (stock === 0) return 'Out of stock';
  if (stock <= 5) return `Only ${stock} left`;
  return 'In stock';
}

export function getProductImage(product: Pick<CatalogProduct, 'image_url' | 'images' | 'name'>) {
  const image = product.images[0];
  return {
    src:
      image?.image_url ?? product.image_url ?? 'https://placehold.co/1200x1200/png?text=SneakerLab',
    alt: image?.alt_text ?? `${product.name} sneaker`,
  };
}
