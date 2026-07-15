import 'package:flutter_test/flutter_test.dart';
import 'package:sneakerlab_mobile/features/commerce/commerce_models.dart';
import 'package:sneakerlab_mobile/features/commerce/commerce_repository.dart';

void main() {
  test('maps a product and reports variant stock correctly', () {
    final product = Product.fromMap({
      'id': 'product-1',
      'name': 'Atlas',
      'slug': 'atlas',
      'price': 110,
      'stock': 0,
      'is_featured': true,
      'image_url': null,
    }, variants: const [
      ProductVariant(id: 'variant-1', colorName: 'Cloud', size: '9', stock: 2, sku: 'ATLAS-9'),
    ]);
    expect(product.price, 110);
    expect(product.isInStock, isTrue);
  });

  test('catalog filter retains an intentional category and sort', () {
    const filter = CatalogFilter();
    final next = filter.copyWith(categorySlug: 'court', sort: CatalogSort.priceLowToHigh, maximumPrice: 150);
    expect(next.categorySlug, 'court');
    expect(next.sort, CatalogSort.priceLowToHigh);
    expect(next.maximumPrice, 150);
  });

  test('cart total and variant stock come from the selected variant', () {
    const product = Product(
      id: 'product-1',
      name: 'Atlas',
      slug: 'atlas',
      price: 110,
      stock: 0,
      isFeatured: false,
      imageUrl: null,
    );
    const variant = ProductVariant(
      id: 'variant-1',
      colorName: 'Cloud',
      size: '9',
      stock: 2,
      sku: 'ATLAS-9',
    );
    const line = CartLine(
      id: 'line-1',
      product: product,
      quantity: 2,
      variant: variant,
    );

    expect(line.availableStock, 2);
    expect(line.total, 220);
  });

  test('unconfigured commerce calls fail without exposing configuration', () async {
    const repository = UnavailableCommerceRepository();

    await expectLater(repository.cart(), throwsA(isA<StateError>()));
    await expectLater(repository.favoriteProducts(), throwsA(isA<StateError>()));
  });
}
