import { getRouteDecision } from '@/lib/auth/authorization';

describe('getRouteDecision', () => {
  it('redirects anonymous users safely', () => {
    expect(getRouteDecision('account', { kind: 'anonymous' })).toEqual({
      allowed: false,
      redirectTo: '/login?next=%2Faccount',
    });
    expect(getRouteDecision('admin', { kind: 'anonymous' })).toEqual({
      allowed: false,
      redirectTo: '/login?next=%2Fadmin',
    });
  });

  it('allows customers into accounts but not administration', () => {
    expect(getRouteDecision('account', { kind: 'authenticated', role: 'customer' })).toEqual({
      allowed: true,
    });
    expect(getRouteDecision('admin', { kind: 'authenticated', role: 'customer' })).toEqual({
      allowed: false,
      redirectTo: '/account',
    });
  });

  it('allows an admin to use administration', () => {
    expect(getRouteDecision('admin', { kind: 'authenticated', role: 'admin' })).toEqual({
      allowed: true,
    });
  });
});
