import { expect, test } from '@playwright/test';

test('guest can add a selected variant, change quantity, and remove it', async ({ page }) => {
  await page.goto('/products/atlas-court');
  await page.getByRole('button', { name: 'Add to cart' }).click();

  await expect(page).toHaveURL(/\/cart\?guest=1$/);
  await expect(page.getByText('Atlas Court')).toBeVisible();
  await page.getByRole('button', { name: 'Increase guest quantity' }).click();
  await expect(page.getByText('$220.00')).toBeVisible();

  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByText('Your guest cart is empty')).toBeVisible();
});

test('checkout requires authentication without losing the checkout destination', async ({
  page,
}) => {
  await page.goto('/checkout');
  await expect(page).toHaveURL(/\/login\?next=%2Fcheckout$/);
});
