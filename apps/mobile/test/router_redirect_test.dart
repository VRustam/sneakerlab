import 'package:flutter_test/flutter_test.dart';
import 'package:sneakerlab_mobile/core/routing/app_router.dart';

void main() {
  group('routeRedirect', () {
    test('redirects anonymous users from protected screens', () {
      expect(routeRedirect(isAuthenticated: false, location: '/account'), '/login');
      expect(routeRedirect(isAuthenticated: false, location: '/cart'), '/login');
      expect(routeRedirect(isAuthenticated: false, location: '/orders/SL-1001'), '/login');
    });

    test('redirects authenticated users away from auth screens', () {
      expect(routeRedirect(isAuthenticated: true, location: '/login'), '/');
      expect(routeRedirect(isAuthenticated: true, location: '/register'), '/');
    });
  });
}
