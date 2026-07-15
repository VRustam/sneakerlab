import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/async_state.dart';
import '../commerce/commerce_providers.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartProvider);
    return AppScaffold(
      title: 'Cart',
      location: '/cart',
      body: cart.when(
        loading: () => const LoadingState(label: 'Loading cart'),
        error: (_, _) => ErrorState(
          message: 'Sign in to use your persistent cart.',
          onRetry: () => ref.invalidate(cartProvider),
        ),
        data: (lines) {
          if (lines.isEmpty) {
            return const EmptyState(
              title: 'Your cart is empty',
              description: 'Add an in-stock sneaker to begin demo checkout.',
            );
          }
          final total = lines.fold<double>(0, (sum, line) => sum + line.total);
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              ...lines.map(
                (line) => Card(
                  child: ListTile(
                    title: Text(line.product.name),
                    subtitle: Text(
                      '${line.variant == null ? 'Standard' : '${line.variant!.colorName} · ${line.variant!.size}'} · \$${line.product.price.toStringAsFixed(2)}',
                    ),
                    trailing: Wrap(
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        IconButton(
                          tooltip: 'Decrease quantity',
                          onPressed: () async {
                            await ref
                                .read(commerceRepositoryProvider)
                                .updateCartLine(line.id, line.quantity - 1);
                            ref.invalidate(cartProvider);
                          },
                          icon: const Icon(Icons.remove_circle_outline),
                        ),
                        Text(line.quantity.toString()),
                        IconButton(
                          tooltip: 'Increase quantity',
                          onPressed: line.quantity >= line.availableStock
                              ? null
                              : () async {
                                  await ref
                                      .read(commerceRepositoryProvider)
                                      .updateCartLine(
                                        line.id,
                                        line.quantity + 1,
                                      );
                                  ref.invalidate(cartProvider);
                                },
                          icon: const Icon(Icons.add_circle_outline),
                        ),
                        IconButton(
                          tooltip: 'Remove from cart',
                          onPressed: () async {
                            await ref
                                .read(commerceRepositoryProvider)
                                .removeCartLine(line.id);
                            ref.invalidate(cartProvider);
                          },
                          icon: const Icon(Icons.delete_outline),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Total: \$${total.toStringAsFixed(2)}',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: () => context.go('/checkout'),
                child: const Text('Demo checkout'),
              ),
            ],
          );
        },
      ),
    );
  }
}
