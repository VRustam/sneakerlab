import 'package:flutter/material.dart';
import '../../core/widgets/app_scaffold.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const AppScaffold(
      title: 'SneakerLab',
      location: '/',
      body: Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Explore sneakers from every angle.', textAlign: TextAlign.center),
              SizedBox(height: 12),
              Text('Featured products and categories will load from Supabase in the commerce phases.', textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }
}
