import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/account/account_screen.dart';
import '../../features/auth/login_screen.dart';
import '../../features/auth/register_screen.dart';
import '../../features/auth/auth_session.dart';
import '../../features/catalog/products_screen.dart';
import '../../features/home/home_screen.dart';
import '../../features/splash/splash_screen.dart';

String? routeRedirect({required bool isAuthenticated, required String location}) {
  const protectedLocations = {'/', '/products', '/account'};
  const authLocations = {'/login', '/register'};

  if (!isAuthenticated && protectedLocations.contains(location)) {
    return '/login';
  }
  if (isAuthenticated && authLocations.contains(location)) {
    return '/';
  }
  return null;
}

final routerProvider = Provider<GoRouter>((ref) {
  final isAuthenticated = ref.watch(authSessionProvider);
  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      if (state.matchedLocation == '/splash') return null;
      return routeRedirect(
        isAuthenticated: isAuthenticated,
        location: state.matchedLocation,
      );
    },
    routes: [
      GoRoute(path: '/splash', builder: (context, state) => const SplashScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(path: '/register', builder: (context, state) => const RegisterScreen()),
      GoRoute(path: '/', builder: (context, state) => const HomeScreen()),
      GoRoute(path: '/products', builder: (context, state) => const ProductsScreen()),
      GoRoute(path: '/account', builder: (context, state) => const AccountScreen()),
    ],
  );
});
