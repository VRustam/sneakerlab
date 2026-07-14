export const userRoles = ['customer', 'admin'] as const;

export type UserRole = (typeof userRoles)[number];

export type ProductStockState = 'in_stock' | 'low_stock' | 'out_of_stock';

/**
 * Phase 2 replaces this small boundary with generated Supabase database types.
 */
export interface ProfileRole {
  id: string;
  role: UserRole;
}
