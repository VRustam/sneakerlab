import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../commerce/commerce_models.dart';
import '../commerce/commerce_providers.dart';

class AdminOrdersScreen extends ConsumerWidget {
  const AdminOrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(ordersProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Orders')),
      body: orders.when(
        data: (items) {
          if (items.isEmpty) {
            return const Center(child: Text('No orders yet'));
          }
          return ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: items.length,
            itemBuilder: (context, index) {
              final order = items[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: _StatusBadge(status: order.status),
                  title: Text(
                    order.orderNumber,
                    style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text(
                    '\$${order.total.toStringAsFixed(2)} · ${order.items.length} items',
                  ),
                  trailing: Text(
                    _formatDate(order.createdAt),
                    style: theme.textTheme.bodySmall,
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }

  String _formatDate(DateTime dt) {
    return '${dt.month}/${dt.day}/${dt.year}';
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});
  final String status;

  Color get _color => switch (status) {
    'pending' => Colors.orange,
    'processing' => Colors.blue,
    'shipped' => Colors.purple,
    'delivered' => Colors.green,
    'cancelled' => Colors.red,
    _ => Colors.grey,
  };

  IconData get _icon => switch (status) {
    'pending' => Icons.schedule,
    'processing' => Icons.autorenew,
    'shipped' => Icons.local_shipping,
    'delivered' => Icons.check_circle,
    'cancelled' => Icons.cancel,
    _ => Icons.help,
  };

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: _color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Icon(_icon, color: _color, size: 20),
    );
  }
}
