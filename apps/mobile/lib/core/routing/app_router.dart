import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/account/account_screen.dart';
import '../../features/admin/admin_dashboard_screen.dart';
import '../../features/admin/admin_orders_screen.dart';
import '../../features/admin/admin_products_screen.dart';
import '../../features/ai_chat/ai_chat_screen.dart';
import '../../features/auth/login_screen.dart';
import '../../features/auth/register_screen.dart';
import '../../features/auth/forgot_password_screen.dart';
import '../../features/auth/auth_session.dart';
import '../../features/catalog/products_screen.dart';
import '../../features/catalog/product_detail_screen.dart';
import '../../features/home/home_screen.dart';
import '../../features/search/search_screen.dart';
import '../../features/splash/splash_screen.dart';
import '../../features/favorites/favorites_screen.dart';
import '../../features/cart/cart_screen.dart';
import '../../features/checkout/checkout_screen.dart';
import '../../features/orders/orders_screen.dart';

String? routeRedirect({
  required bool isAuthenticated,
  required String location,
}) {
  const protectedLocations = {
    '/favorites',
    '/cart',
    '/checkout',
    '/account',
    '/orders',
    '/admin',
    '/admin/products',
    '/admin/orders',
    '/admin/coupons',
    '/admin/analytics',
  };
  const authLocations = {'/login', '/register', '/forgot-password'};

  final isProtected =
      protectedLocations.contains(location) || location.startsWith('/orders/');
  if (!isAuthenticated && isProtected) {
    return '/login';
  }
  if (isAuthenticated && authLocations.contains(location)) {
    return '/';
  }
  return null;
}

final routerProvider = Provider<GoRouter>((ref) {
  final isAuthenticated = ref.watch(authSessionProvider) != null;
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
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(path: '/', builder: (context, state) => const HomeScreen()),
      GoRoute(
        path: '/products',
        builder: (context, state) => const ProductsScreen(),
      ),
      GoRoute(
        path: '/products/:slug',
        builder: (context, state) =>
            ProductDetailScreen(slug: state.pathParameters['slug']!),
      ),
      GoRoute(
        path: '/search',
        builder: (context, state) => const SearchScreen(),
      ),
      GoRoute(
        path: '/ai-chat',
        builder: (context, state) => const AiChatScreen(),
      ),
      GoRoute(
        path: '/favorites',
        builder: (context, state) => const FavoritesScreen(),
      ),
      GoRoute(path: '/cart', builder: (context, state) => const CartScreen()),
      GoRoute(
        path: '/checkout',
        builder: (context, state) => const CheckoutScreen(),
      ),
      GoRoute(
        path: '/orders',
        builder: (context, state) => const OrdersScreen(),
      ),
      GoRoute(
        path: '/orders/:number',
        builder: (context, state) =>
            OrderDetailScreen(number: state.pathParameters['number']!),
      ),
      GoRoute(
        path: '/account',
        builder: (context, state) => const AccountScreen(),
      ),
      // Admin routes
      GoRoute(
        path: '/admin',
        builder: (context, state) => const AdminDashboardScreen(),
      ),
      GoRoute(
        path: '/admin/products',
        builder: (context, state) => const AdminProductsScreen(),
      ),
      GoRoute(
        path: '/admin/orders',
        builder: (context, state) => const AdminOrdersScreen(),
      ),
    ],
  );
});

