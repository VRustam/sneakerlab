import { expect, test } from '@playwright/test';

test('catalog displays seeded products and search narrows results', async ({ page }) => {
  await page.goto('/products');
  await expect(page.getByRole('heading', { name: 'Find your next pair' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Atlas Court', exact: true })).toBeVisible();

  await page.getByLabel('Search').fill('Metro');
  await page.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page).toHaveURL(/q=Metro/);
  await expect(page.getByRole('link', { name: 'Metro Knit', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Atlas Court', exact: true })).not.toBeVisible();
});

test('category filtering and clear controls preserve shareable URL state', async ({ page }) => {
  await page.goto('/products');
  await page.getByLabel('Category').selectOption('court');
  await page.getByRole('button', { name: 'Apply filters' }).click();

  await expect(page).toHaveURL(/category=court/);
  await expect(page.getByRole('link', { name: 'Atlas Court', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Metro Knit', exact: true })).not.toBeVisible();

  await page.getByRole('link', { name: 'Clear' }).click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(page.getByRole('link', { name: 'Metro Knit', exact: true })).toBeVisible();
});

test('price sorting, detail navigation, and variant availability work', async ({ page }) => {
  await page.goto('/products');
  await page.getByLabel('Sort').selectOption('price_asc');
  await page.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page).toHaveURL(/sort=price_asc/);

  const productLinks = page.getByRole('link', {
    name: /View Atlas Court|View Form Canvas|View Core Motion/,
  });
  await expect(productLinks.first()).toHaveAccessibleName('View Form Canvas');

  await page.getByRole('link', { name: 'Atlas Court', exact: true }).click();
  await expect(page).toHaveURL(/\/products\/atlas-court$/);
  await page.getByRole('button', { name: 'Ink' }).click();
  await expect(page.getByRole('button', { name: '9' })).toBeDisabled();
  await expect(page.getByText('Ink, size 8: 5 available.')).toBeVisible();
});

test('anonymous favorite action navigates to login without losing the product path', async ({
  page,
}) => {
  await page.goto('/products/atlas-court');
  await page.getByRole('link', { name: /sign in to save atlas court/i }).click();
  await expect(page).toHaveURL(/\/login\?next=%2Fproducts%2Fatlas-court$/);
});

test('mobile catalog has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/products');
  await expect(page.getByRole('heading', { name: 'Find your next pair' })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth);
});
