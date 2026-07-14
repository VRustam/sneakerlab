import 'package:flutter/material.dart';
import '../../core/widgets/app_scaffold.dart';

class ProductsScreen extends StatelessWidget {
  const ProductsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const AppScaffold(
      title: 'Products',
      location: '/products',
      body: Center(child: Text('The product catalog is being prepared.')),
    );
  }
}
