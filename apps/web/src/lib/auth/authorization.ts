import type { AuthIdentity } from '@/lib/auth/types';

export type ProtectedRoute = 'account' | 'admin';
export type RouteDecision = { allowed: true } | { allowed: false; redirectTo: string };

export function getRouteDecision(route: ProtectedRoute, identity: AuthIdentity): RouteDecision {
  if (route === 'account') {
    return identity.kind === 'authenticated'
      ? { allowed: true }
      : { allowed: false, redirectTo: '/login?next=%2Faccount' };
  }

  if (identity.kind === 'authenticated' && identity.role === 'admin') return { allowed: true };
  if (identity.kind === 'authenticated') return { allowed: false, redirectTo: '/account' };
  return { allowed: false, redirectTo: '/login?next=%2Fadmin' };
}
