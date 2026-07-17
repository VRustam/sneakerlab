import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class AdminDashboardScreen extends ConsumerWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Panel'),
        actions: [
          IconButton(
            icon: const Icon(Icons.storefront),
            tooltip: 'View Store',
            onPressed: () => context.go('/'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Quick stats cards
          Row(
            children: [
              Expanded(child: _StatCard(
                icon: Icons.inventory_2,
                label: 'Products',
                value: '—',
                color: theme.colorScheme.primary,
              )),
              const SizedBox(width: 12),
              Expanded(child: _StatCard(
                icon: Icons.shopping_cart,
                label: 'Orders',
                value: '—',
                color: theme.colorScheme.tertiary,
              )),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _StatCard(
                icon: Icons.warning_amber,
                label: 'Low Stock',
                value: '—',
                color: Colors.orange,
              )),
              const SizedBox(width: 12),
              Expanded(child: _StatCard(
                icon: Icons.attach_money,
                label: 'Revenue',
                value: '—',
                color: Colors.green,
              )),
            ],
          ),
          const SizedBox(height: 24),

          // Navigation tiles
          Text('Manage', style: theme.textTheme.titleLarge),
          const SizedBox(height: 12),
          _AdminTile(
            icon: Icons.inventory_2_outlined,
            title: 'Products',
            subtitle: 'Add, edit, and manage inventory',
            onTap: () => context.push('/admin/products'),
          ),
          _AdminTile(
            icon: Icons.receipt_long_outlined,
            title: 'Orders',
            subtitle: 'View and manage customer orders',
            onTap: () => context.push('/admin/orders'),
          ),
          _AdminTile(
            icon: Icons.local_offer_outlined,
            title: 'Coupons',
            subtitle: 'Create and manage discount codes',
            onTap: () => context.push('/admin/coupons'),
          ),
          _AdminTile(
            icon: Icons.bar_chart_outlined,
            title: 'Analytics',
            subtitle: 'Revenue charts and sales data',
            onTap: () => context.push('/admin/analytics'),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 8),
            Text(
              value,
              style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            Text(label, style: theme.textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}

class _AdminTile extends StatelessWidget {
  const _AdminTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
