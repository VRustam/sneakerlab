import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sneakerlab_mobile/features/catalog/products_screen.dart';
import 'package:sneakerlab_mobile/features/commerce/commerce_models.dart';

void main() {
  testWidgets('product card presents the product and its stock state', (
    tester,
  ) async {
    const product = Product(
      id: 'product-1',
      name: 'Atlas Court',
      slug: 'atlas-court',
      price: 110,
      stock: 3,
      isFeatured: true,
      imageUrl: null,
    );

    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: ProductCard(product: product))),
    );

    expect(find.text('Atlas Court'), findsOneWidget);
    expect(find.text('\$110.00'), findsOneWidget);
    expect(find.text('In stock'), findsOneWidget);
  });
}
