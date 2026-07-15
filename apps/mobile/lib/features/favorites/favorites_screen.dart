import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/async_state.dart';
import '../catalog/products_screen.dart';
import '../commerce/commerce_providers.dart';

class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final products = ref.watch(favoriteProductsProvider);
    return AppScaffold(
      title: 'Favorites',
      location: '/favorites',
      body: products.when(
        loading: () => const LoadingState(label: 'Loading favorites'),
        error: (_, _) => ErrorState(
          message: 'Sign in to view your favorites.',
          onRetry: () => ref.invalidate(favoriteProductsProvider),
        ),
        data: (items) {
          if (items.isEmpty) {
            return const EmptyState(
              title: 'No favorites yet',
              description: 'Tap a heart on a product to save it.',
            );
          }
          return GridView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: items.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisExtent: 290,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemBuilder: (context, index) => ProductCard(product: items[index]),
          );
        },
      ),
    );
  }
}
