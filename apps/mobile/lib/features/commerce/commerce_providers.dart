import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'commerce_models.dart';
import 'commerce_repository.dart';

final commerceRepositoryProvider = Provider<CommerceRepository>(
  (ref) => const UnavailableCommerceRepository(),
);

class CatalogFilterController extends Notifier<CatalogFilter> {
  @override
  CatalogFilter build() => const CatalogFilter();

  void update(CatalogFilter value) => state = value;
}

final catalogFilterProvider =
    NotifierProvider<CatalogFilterController, CatalogFilter>(
      CatalogFilterController.new,
    );
final categoriesProvider = FutureProvider<List<ProductCategory>>(
  (ref) => ref.watch(commerceRepositoryProvider).categories(),
);
final productsProvider = FutureProvider<List<Product>>(
  (ref) => ref
      .watch(commerceRepositoryProvider)
      .products(ref.watch(catalogFilterProvider)),
);
final productProvider = FutureProvider.family<Product?, String>(
  (ref, slug) => ref.watch(commerceRepositoryProvider).productBySlug(slug),
);
final favoritesProvider = FutureProvider<Set<String>>(
  (ref) => ref.watch(commerceRepositoryProvider).favoriteIds(),
);
final favoriteProductsProvider = FutureProvider<List<Product>>(
  (ref) => ref.watch(commerceRepositoryProvider).favoriteProducts(),
);
final cartProvider = FutureProvider<List<CartLine>>(
  (ref) => ref.watch(commerceRepositoryProvider).cart(),
);
final ordersProvider = FutureProvider<List<CustomerOrder>>(
  (ref) => ref.watch(commerceRepositoryProvider).orders(),
);
final profileProvider = FutureProvider<CustomerProfile>(
  (ref) => ref.watch(commerceRepositoryProvider).profile(),
);
