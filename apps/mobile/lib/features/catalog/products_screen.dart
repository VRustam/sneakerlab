import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/async_state.dart';
import '../commerce/commerce_models.dart';
import '../commerce/commerce_providers.dart';

class ProductsScreen extends ConsumerWidget {
  const ProductsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final products = ref.watch(productsProvider);
    final filter = ref.watch(catalogFilterProvider);
    final categories = ref.watch(categoriesProvider);
    return AppScaffold(
      title: 'Shop',
      location: '/products',
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(productsProvider);
          ref.invalidate(categoriesProvider);
          await ref.read(productsProvider.future);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextField(
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.search),
                labelText: 'Search sneakers',
              ),
              onSubmitted: (value) => ref
                  .read(catalogFilterProvider.notifier)
                  .update(filter.copyWith(query: value, page: 0)),
            ),
            const SizedBox(height: 12),
            categories.when(
              data: (items) => Wrap(
                spacing: 8,
                children: [
                  ChoiceChip(
                    label: const Text('All'),
                    selected: filter.categorySlug == null,
                    onSelected: (_) => ref
                        .read(catalogFilterProvider.notifier)
                        .update(filter.copyWith(clearCategory: true, page: 0)),
                  ),
                  ...items.map(
                    (category) => ChoiceChip(
                      label: Text(category.name),
                      selected: filter.categorySlug == category.slug,
                      onSelected: (_) => ref
                          .read(catalogFilterProvider.notifier)
                          .update(
                            filter.copyWith(
                              categorySlug: category.slug,
                              page: 0,
                            ),
                          ),
                    ),
                  ),
                ],
              ),
              loading: () => const SizedBox(height: 36),
              error: (_, _) => const SizedBox.shrink(),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<CatalogSort>(
              key: ValueKey(filter.sort),
              initialValue: filter.sort,
              decoration: const InputDecoration(labelText: 'Sort'),
              items: const [
                DropdownMenuItem(
                  value: CatalogSort.newest,
                  child: Text('Newest'),
                ),
                DropdownMenuItem(
                  value: CatalogSort.priceLowToHigh,
                  child: Text('Price: low to high'),
                ),
                DropdownMenuItem(
                  value: CatalogSort.priceHighToLow,
                  child: Text('Price: high to low'),
                ),
              ],
              onChanged: (value) {
                if (value != null) {
                  ref
                      .read(catalogFilterProvider.notifier)
                      .update(filter.copyWith(sort: value, page: 0));
                }
              },
            ),
            const SizedBox(height: 16),
            products.when(
              loading: () => const SizedBox(
                height: 320,
                child: LoadingState(label: 'Loading catalog'),
              ),
              error: (_, _) => SizedBox(
                height: 320,
                child: ErrorState(
                  message:
                      'Catalog is unavailable. Check your connection or app configuration.',
                  onRetry: () => ref.invalidate(productsProvider),
                ),
              ),
              data: (items) => items.isEmpty
                  ? const SizedBox(
                      height: 320,
                      child: EmptyState(
                        title: 'No sneakers found',
                        description: 'Try another search or filter.',
                      ),
                    )
                  : LayoutBuilder(
                      builder: (context, constraints) {
                        final count = constraints.maxWidth > 640 ? 3 : 2;
                        return GridView.builder(
                          itemCount: items.length,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: count,
                                mainAxisExtent: 290,
                                crossAxisSpacing: 12,
                                mainAxisSpacing: 12,
                              ),
                          itemBuilder: (context, index) =>
                              ProductCard(product: items[index]),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class ProductCard extends StatelessWidget {
  const ProductCard({super.key, required this.product});
  final Product product;
  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    label: product.name,
    child: InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: () => context.go('/products/${product.slug}'),
      child: Card(
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: product.imageUrl == null
                  ? const Center(child: Icon(Icons.image_outlined, size: 40))
                  : Image.network(
                      product.imageUrl!,
                      fit: BoxFit.cover,
                      width: double.infinity,
                      errorBuilder: (_, _, _) => const Center(
                        child: Icon(Icons.broken_image_outlined),
                      ),
                    ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '\$${product.price.toStringAsFixed(2)}',
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                  Text(
                    product.isInStock ? 'In stock' : 'Out of stock',
                    style: TextStyle(
                      color: product.isInStock
                          ? Colors.green
                          : Theme.of(context).colorScheme.error,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ),
  );
}
