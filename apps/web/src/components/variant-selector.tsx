'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getVariantSelectionState } from '@/lib/catalog/variant-selection';
import type { CatalogVariant } from '@/lib/catalog/types';
import { cn } from '@/lib/utils';

interface VariantSelectorProps {
  variants: CatalogVariant[];
}

export function VariantSelector({ variants }: VariantSelectorProps) {
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const selection = getVariantSelectionState(variants, color, size);
  const colors = Array.from(
    new Map(variants.map((variant) => [variant.color_name, variant.color_hex])).entries(),
  );

  if (variants.length === 0) {
    return <p className="text-sm text-muted-foreground">This style has no selectable variants.</p>;
  }

  return (
    <div className="space-y-5" aria-label="Product options">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Color</legend>
        <div className="flex flex-wrap gap-2">
          {colors.map(([name, hex]) => (
            <ColorOption
              hex={hex}
              isSelected={selection.color === name}
              key={name}
              name={name}
              onSelect={() => {
                setColor(name);
                setSize(null);
              }}
              purchasable={variants.some(
                (variant) => variant.color_name === name && variant.stock > 0,
              )}
            />
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Size</legend>
        <div className="flex flex-wrap gap-2">
          {selection.availableSizes.map((availableSize) => {
            const variant = variants.find(
              (item) => item.color_name === selection.color && item.size === availableSize,
            );
            const isAvailable = Boolean(variant && variant.stock > 0);
            return (
              <Button
                aria-pressed={selection.size === availableSize}
                className={cn(!isAvailable && 'line-through')}
                disabled={!isAvailable}
                key={availableSize}
                onClick={() => setSize(availableSize)}
                size="sm"
                variant={selection.size === availableSize ? 'default' : 'outline'}
              >
                {availableSize}
              </Button>
            );
          })}
        </div>
      </fieldset>
      <div
        aria-live="polite"
        className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground"
      >
        {selection.selectedVariant
          ? `${selection.selectedVariant.color_name}, size ${selection.selectedVariant.size}: ${selection.selectedVariant.stock} available.`
          : 'Choose an available color and size combination.'}
      </div>
      <Button disabled={!selection.selectedVariant} size="lg" type="button">
        {selection.selectedVariant ? 'Add to cart in Phase 4' : 'Select an available option'}
      </Button>
    </div>
  );
}

interface ColorOptionProps {
  name: string;
  hex: string | null;
  isSelected: boolean;
  purchasable: boolean;
  onSelect: () => void;
}

function ColorOption({ name, hex, isSelected, purchasable, onSelect }: ColorOptionProps) {
  return (
    <Button
      aria-pressed={isSelected}
      className="gap-2"
      disabled={!purchasable}
      onClick={onSelect}
      size="sm"
      variant={isSelected ? 'default' : 'outline'}
    >
      <span
        aria-hidden="true"
        className="size-3 rounded-full border border-border"
        style={{ backgroundColor: hex ?? '#d4d4d4' }}
      />
      {name}
    </Button>
  );
}
