import type { Json } from '@/lib/supabase/database.types';

export interface CartProductSnapshot {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number;
  stock: number;
  isActive: boolean;
}

export interface CartVariantSnapshot {
  id: string;
  colorName: string;
  size: string;
  stock: number;
}

export interface CartLine {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  product: CartProductSnapshot | null;
  variant: CartVariantSnapshot | null;
  availableStock: number;
  isAvailable: boolean;
}

export interface CartSummary {
  lines: CartLine[];
  subtotal: number;
  itemCount: number;
  hasUnavailableLine: boolean;
}

export interface GuestCartLine {
  key: string;
  productId: string;
  variantId: string | null;
  productName: string;
  imageUrl: string | null;
  price: number;
  colorName: string | null;
  size: string | null;
  availableStock: number;
  quantity: number;
}

export interface GuestCartPayload {
  productId: string;
  variantId: string | null;
  productName: string;
  imageUrl: string | null;
  price: number;
  colorName: string | null;
  size: string | null;
  availableStock: number;
}

export const orderStatusValues = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof orderStatusValues)[number];

export interface ShippingAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface CheckoutInput {
  customerName: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  idempotencyKey: string;
}

export interface OrderItemSnapshot {
  id: string;
  productName: string;
  productImageUrl: string | null;
  selectedSize: string | null;
  selectedColor: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
  items: OrderItemSnapshot[];
}

export interface CustomerProfile {
  fullName: string | null;
  avatarUrl: string | null;
}

export function asShippingAddress(value: Json): ShippingAddress {
  const address = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return {
    addressLine1: typeof address.addressLine1 === 'string' ? address.addressLine1 : '',
    addressLine2: typeof address.addressLine2 === 'string' ? address.addressLine2 : undefined,
    city: typeof address.city === 'string' ? address.city : '',
    region: typeof address.region === 'string' ? address.region : '',
    postalCode: typeof address.postalCode === 'string' ? address.postalCode : '',
    country: typeof address.country === 'string' ? address.country : '',
  };
}
