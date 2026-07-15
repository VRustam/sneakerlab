import { expect, test } from '@playwright/test';

const password = 'SneakerLabE2E123!';

async function signIn(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('You are signed in. Your session is ready.')).toBeVisible();
}

test('a customer cannot open the admin dashboard', async ({ page }) => {
  await signIn(page, 'customer@sneakerlab.local');
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/account$/);
});

test('an admin manages catalog, media validation, and allowed order status changes', async ({
  page,
}) => {
  const productName = 'E2E Admin Court';
  const productSlug = 'e2e-admin-court';

  await signIn(page, 'admin@sneakerlab.local');
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Commerce dashboard' })).toBeVisible();

  await page.goto('/admin/products/new');
  await page.getByLabel('Product name').fill(productName);
  await page.getByLabel('Slug').fill(productSlug);
  await page.getByLabel('Price').fill('149.99');
  await page.getByLabel('Default stock').fill('10');
  await page.getByRole('button', { name: 'Create product' }).click();
  await expect(page).toHaveURL(/\/admin\/products\/[0-9a-f-]+\/edit$/);

  await page.getByRole('button', { name: 'Add variant' }).click();
  await page.getByLabel('Color').fill('Cloud');
  await page.getByLabel('Size').fill('9');
  await page.getByLabel('Stock').last().fill('7');
  await page.getByLabel('SKU').fill('E2E-ADMIN-CLOUD-9');
  await page.getByRole('button', { name: 'Save product' }).click();
  await expect(page.getByText('Product saved.')).toBeVisible();

  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles({
      name: 'unsafe.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not-an-image'),
    });
  await expect(page.getByRole('alert')).toHaveText(/Choose a JPEG, PNG, or WebP image/);

  await page.goto('/products/' + productSlug);
  await expect(page.getByRole('heading', { name: productName })).toBeVisible();

  await page.goto('/admin/orders/50000000-0000-0000-0000-000000000001');
  await page.getByLabel('Update status').selectOption('processing');
  await page.getByRole('button', { name: 'Update status' }).click();
  await expect(page.getByRole('status')).toHaveText('Order status updated.');

  await page.reload();
  await expect(page.getByText('processing', { exact: true })).toBeVisible();
  await expect(page.locator('#order-status option[value="delivered"]')).toBeDisabled();

  await page.goto('/admin/products');
  await page
    .getByRole('row', { name: new RegExp(productName) })
    .getByRole('link', { name: 'Edit' })
    .click();
  await page.getByLabel('Active in public catalog').uncheck();
  await page.getByRole('button', { name: 'Save product' }).click();
  await expect(page.getByText('Product saved.')).toBeVisible();

  await page.goto('/products/' + productSlug);
  await expect(page.getByRole('heading', { name: 'This page stepped out.' })).toBeVisible();
});
