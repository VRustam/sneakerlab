import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/async_state.dart';
import '../commerce/commerce_models.dart';
import '../commerce/commerce_providers.dart';
import 'product_model_viewer.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  const ProductDetailScreen({super.key, required this.slug});
  final String slug;
  @override
  ConsumerState<ProductDetailScreen> createState() =>
      _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  ProductVariant? _selected;
  String? _message;
  @override
  Widget build(BuildContext context) {
    final product = ref.watch(productProvider(widget.slug));
    final favoriteIds = ref.watch(favoritesProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Product details')),
      body: product.when(
        loading: () => const LoadingState(label: 'Loading product'),
        error: (_, _) => ErrorState(
          message: 'Product details are unavailable.',
          onRetry: () => ref.invalidate(productProvider(widget.slug)),
        ),
        data: (item) {
          if (item == null) {
            return const EmptyState(
              title: 'Product unavailable',
              description: 'This product may no longer be active.',
            );
          }
          final images = item.images.isEmpty
              ? [item.imageUrl].whereType<String>().toList()
              : item.images;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              if (images.isNotEmpty)
                SizedBox(
                  height: 300,
                  child: PageView(
                    children: images
                        .map(
                          (url) => Image.network(
                            url,
                            fit: BoxFit.cover,
                            errorBuilder: (_, _, _) => const Center(
                              child: Icon(Icons.broken_image_outlined),
                            ),
                          ),
                        )
                        .toList(),
                  ),
                ),
              const SizedBox(height: 16),
              Text(item.name, style: Theme.of(context).textTheme.headlineSmall),
              Text(
                '\$${item.price.toStringAsFixed(2)}',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                item.description ??
                    item.shortDescription ??
                    'Product details are coming soon.',
              ),
              const SizedBox(height: 16),
              ProductModelViewer(
                modelUrl: item.modelUrl,
                posterUrl: images.isEmpty ? null : images.first,
                productName: item.name,
              ),
              const SizedBox(height: 16),
              if (item.variants.isNotEmpty)
                Wrap(
                  spacing: 8,
                  children: item.variants
                      .map(
                        (variant) => ChoiceChip(
                          label: Text('${variant.colorName} · ${variant.size}'),
                          selected: _selected?.id == variant.id,
                          onSelected: variant.stock == 0
                              ? null
                              : (_) => setState(() => _selected = variant),
                        ),
                      )
                      .toList(),
                ),
              const SizedBox(height: 12),
              favoriteIds.when(
                loading: () => const SizedBox.shrink(),
                error: (_, _) => const Text('Sign in to save favorites.'),
                data: (ids) {
                  final saved = ids.contains(item.id);
                  return OutlinedButton.icon(
                    icon: Icon(saved ? Icons.favorite : Icons.favorite_outline),
                    label: Text(saved ? 'Remove favorite' : 'Save favorite'),
                    onPressed: () async {
                      try {
                        await ref
                            .read(commerceRepositoryProvider)
                            .setFavorite(item.id, !saved);
                        ref.invalidate(favoritesProvider);
                        ref.invalidate(favoriteProductsProvider);
                      } catch (_) {
                        if (mounted) {
                          setState(
                            () => _message = 'Sign in to save favorites.',
                          );
                        }
                      }
                    },
                  );
                },
              ),
              const SizedBox(height: 8),
              FilledButton.icon(
                icon: const Icon(Icons.add_shopping_cart),
                label: Text(item.isInStock ? 'Add to cart' : 'Out of stock'),
                onPressed:
                    !item.isInStock ||
                        (item.variants.isNotEmpty && _selected == null)
                    ? null
                    : () async {
                        try {
                          await ref
                              .read(commerceRepositoryProvider)
                              .addCartLine(item.id, _selected?.id);
                          ref.invalidate(cartProvider);
                          if (mounted) {
                            setState(() => _message = 'Added to your cart.');
                          }
                        } catch (_) {
                          if (mounted) {
                            setState(
                              () => _message =
                                  'Sign in to add this item to your cart.',
                            );
                          }
                        }
                      },
              ),
              if (_message != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(_message!, semanticsLabel: _message),
                ),
            ],
          );
        },
      ),
    );
  }
}
