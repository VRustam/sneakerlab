import { z } from 'zod';

const text = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`);

export const checkoutSchema = z.object({
  customerName: text('Contact name', 120),
  customerEmail: z.string().trim().email('Enter a valid email address.').max(254),
  addressLine1: text('Address line 1', 160),
  addressLine2: z.string().trim().max(160).optional(),
  city: text('City', 100),
  region: text('State or region', 100),
  postalCode: text('Postal code', 32),
  country: text('Country', 100),
  idempotencyKey: z.string().uuid('Please refresh the page and try checkout again.'),
  couponCode: z.string().trim().max(50).optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function getCheckoutInput(formData: FormData) {
  return checkoutSchema.safeParse({
    customerName: formData.get('customerName'),
    customerEmail: formData.get('customerEmail'),
    addressLine1: formData.get('addressLine1'),
    addressLine2: formData.get('addressLine2') || undefined,
    city: formData.get('city'),
    region: formData.get('region'),
    postalCode: formData.get('postalCode'),
    country: formData.get('country'),
    idempotencyKey: formData.get('idempotencyKey'),
    couponCode: formData.get('couponCode') || undefined,
  });
}
