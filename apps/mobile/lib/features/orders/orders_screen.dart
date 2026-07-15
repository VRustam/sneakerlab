import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/async_state.dart';
import '../commerce/commerce_providers.dart';

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(ordersProvider);
    return AppScaffold(title: 'Orders', location: '/account', body: orders.when(
      loading: () => const LoadingState(label: 'Loading orders'),
      error: (_, _) => ErrorState(message: 'Orders are unavailable.', onRetry: () => ref.invalidate(ordersProvider)),
      data: (items) => items.isEmpty ? const EmptyState(title: 'No orders yet', description: 'Completed demo checkout orders appear here.') : RefreshIndicator(
        onRefresh: () async { ref.invalidate(ordersProvider); await ref.read(ordersProvider.future); },
        child: ListView.builder(itemCount: items.length, itemBuilder: (context, index) {
          final order = items[index];
          return ListTile(title: Text(order.number), subtitle: Text(order.status), trailing: Text('\$${order.total.toStringAsFixed(2)}'), onTap: () => context.go('/orders/${order.number}'));
        }),
      ),
    ));
  }
}

class OrderDetailScreen extends ConsumerWidget {
  const OrderDetailScreen({super.key, required this.number});
  final String number;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(appBar: AppBar(title: const Text('Order details')), body: FutureBuilder(
      future: ref.read(commerceRepositoryProvider).orderByNumber(number),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const LoadingState(label: 'Loading order');
        final order = snapshot.data;
        if (order == null) return const EmptyState(title: 'Order unavailable', description: 'This order is not available for this account.');
        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(
              order.number,
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            Chip(label: Text(order.status)),
            ...order.items.map(
              (item) => ListTile(
                title: Text(item.name),
                subtitle: Text('Quantity ${item.quantity}'),
                trailing: Text('\$${item.total.toStringAsFixed(2)}'),
              ),
            ),
            const Divider(),
            Text(
              'Total \$${order.total.toStringAsFixed(2)}',
              style: Theme.of(context).textTheme.titleLarge,
            ),
          ],
        );
      },
    ));
  }
}
