import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/async_state.dart';
import '../commerce/commerce_models.dart';
import '../commerce/commerce_providers.dart';
import '../catalog/products_screen.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final products = ref.watch(productsProvider);
    final categories = ref.watch(categoriesProvider);
    return AppScaffold(
      title: 'SneakerLab',
      location: '/',
      body: RefreshIndicator(
        onRefresh: () async { ref.invalidate(productsProvider); ref.invalidate(categoriesProvider); await ref.read(productsProvider.future); },
        child: ListView(padding: const EdgeInsets.all(16), children: [
          Card(child: Padding(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Sneakers for every angle.', style: Theme.of(context).textTheme.headlineSmall), const SizedBox(height: 8), const Text('Discover active catalog styles, saved favorites, and secure demo checkout.'), const SizedBox(height: 12), FilledButton(onPressed: () => context.go('/products'), child: const Text('Shop sneakers'))]))),
          const SizedBox(height: 20),
          Text('Categories', style: Theme.of(context).textTheme.titleLarge),
          categories.when(data: (items) => Wrap(spacing: 8, children: items.map((item) => ActionChip(label: Text(item.name), onPressed: () { ref.read(catalogFilterProvider.notifier).update(CatalogFilter(categorySlug: item.slug)); context.go('/products'); })).toList()), loading: () => const Padding(padding: EdgeInsets.all(12), child: LinearProgressIndicator()), error: (_, _) => const Text('Categories are unavailable.')),
          const SizedBox(height: 20),
          Text('Featured', style: Theme.of(context).textTheme.titleLarge),
          products.when(loading: () => const SizedBox(height: 220, child: LoadingState()), error: (_, _) => ErrorState(message: 'Featured products are unavailable.', onRetry: () => ref.invalidate(productsProvider)), data: (items) {
            final featured = items.where((item) => item.isFeatured).take(4).toList();
            return featured.isEmpty ? const EmptyState(title: 'No featured products', description: 'Check back soon.') : SizedBox(height: 280, child: ListView.separated(scrollDirection: Axis.horizontal, itemCount: featured.length, separatorBuilder: (_, _) => const SizedBox(width: 12), itemBuilder: (context, index) => SizedBox(width: 180, child: ProductCard(product: featured[index]))));
          }),
          const ListTile(leading: Icon(Icons.threed_rotation), title: Text('3D viewer teaser'), subtitle: Text('Supported product models receive an interactive mobile viewer in the final portfolio phase.')),
        ]),
      ),
    );
  }
}
