import type { CatalogVariant } from '@/lib/catalog/types';

export interface VariantSelectionState {
  color: string | null;
  size: string | null;
  selectedVariant: CatalogVariant | null;
  availableSizes: string[];
}

export function getVariantSelectionState(
  variants: CatalogVariant[],
  color: string | null,
  size: string | null,
): VariantSelectionState {
  const colors = new Set(variants.map((variant) => variant.color_name));
  const firstPurchasableColor = variants.find((variant) => variant.stock > 0)?.color_name;
  const resolvedColor =
    color && colors.has(color) ? color : (firstPurchasableColor ?? variants[0]?.color_name ?? null);
  const colorVariants = variants.filter((variant) => variant.color_name === resolvedColor);
  const availableSizes = Array.from(new Set(colorVariants.map((variant) => variant.size))).sort(
    (left, right) => Number(left) - Number(right),
  );
  const firstAvailableSize =
    colorVariants.find((variant) => variant.stock > 0)?.size ?? availableSizes[0] ?? null;
  const resolvedSize = size && availableSizes.includes(size) ? size : firstAvailableSize;
  const selectedVariant =
    colorVariants.find((variant) => variant.size === resolvedSize && variant.stock > 0) ?? null;

  return { color: resolvedColor, size: resolvedSize, selectedVariant, availableSizes };
}
