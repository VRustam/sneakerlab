import { expect, test } from '@playwright/test';

test('public navigation and auth validation work', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Explore sneakers from every angle.' }),
  ).toBeVisible();

  await page.getByRole('link', { name: /explore products/i }).click();
  await expect(page).toHaveURL(/\/products$/);

  await page.goto('/login');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
});

test('anonymous protected routes redirect safely', async ({ page }) => {
  await page.goto('/account');
  await expect(page).toHaveURL(/\/login\?next=%2Faccount$/);

  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login\?next=%2Fadmin$/);
});

test('mobile layout has no obvious horizontal overflow and keyboard reaches a primary action', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth);

  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toBeVisible();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('link', { name: 'Create account' })).toBeVisible();
});
