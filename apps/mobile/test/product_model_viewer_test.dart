import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sneakerlab_mobile/features/catalog/product_model_viewer.dart';

void main() {
  group('resolveProductModelSource', () {
    test('maps the seeded web model to the bundled mobile asset', () {
      expect(
        resolveProductModelSource('/models/pulse-layer.gltf'),
        'assets/models/pulse-layer.gltf',
      );
    });

    test('accepts only secure remote model URLs', () {
      expect(
        resolveProductModelSource('https://cdn.example.com/pulse.glb'),
        'https://cdn.example.com/pulse.glb',
      );
      expect(
        resolveProductModelSource('ftp://cdn.example.com/pulse.glb'),
        isNull,
      );
    });
  });

  testWidgets('keeps an image fallback when no usable model exists', (
    tester,
  ) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(body: ProductModelViewer(productName: 'Pulse Layer')),
      ),
    );

    expect(find.textContaining('3D preview unavailable'), findsOneWidget);
    expect(find.byIcon(Icons.threed_rotation_outlined), findsOneWidget);
  });
}
