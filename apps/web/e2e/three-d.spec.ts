import { expect, test } from '@playwright/test';

test('a product without a model keeps an accessible image-based 3D fallback', async ({ page }) => {
  await page.goto('/products/atlas-court');

  const preview = page.getByRole('region', { name: 'Atlas Court 3D preview' });
  await expect(preview).toBeVisible();
  await expect(page.getByText(/3D preview is unavailable for this product/i)).toBeVisible();
  await expect(preview.getByRole('img', { name: /Atlas Court sneaker/i })).toBeVisible();
});

test('a supported product describes pointer and touch 3D controls', async ({ page }) => {
  await page.goto('/products/pulse-layer');

  await expect(page.getByRole('region', { name: 'Pulse Layer 3D preview' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '3D product preview' })).toBeVisible();
  await expect(page.getByText(/Drag to rotate.*pinch gesture to zoom/i)).toBeVisible();
});

test('reduced-motion visitors can opt into the interactive preview', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/products/pulse-layer');

  await expect(
    page.getByText(/Motion is paused to respect your reduced-motion preference/i),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enable interactive 3D preview' })).toBeVisible();
});

test('product disclosures remain usable alongside the 3D section', async ({ page }) => {
  await page.goto('/products/pulse-layer');

  await page.getByText('Shipping and returns', { exact: true }).click();
  await expect(page.getByText(/transparent flat-rate shipping policy/i)).toBeVisible();
  await expect(page.getByText('Care guidance', { exact: true })).toBeVisible();
});
