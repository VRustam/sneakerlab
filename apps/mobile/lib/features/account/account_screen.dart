import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/async_state.dart';
import '../auth/auth_session.dart';
import '../commerce/commerce_providers.dart';

class AccountScreen extends ConsumerStatefulWidget {
  const AccountScreen({super.key});
  @override ConsumerState<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends ConsumerState<AccountScreen> {
  final _name = TextEditingController();
  bool _initialized = false;
  @override void dispose() { _name.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(profileProvider);
    return AppScaffold(
      title: 'Account',
      location: '/account',
      body: profile.when(
        loading: () => const LoadingState(label: 'Loading account'),
        error: (_, _) => ErrorState(message: 'Account details are unavailable.', onRetry: () => ref.invalidate(profileProvider)),
        data: (item) {
          if (!_initialized) { _name.text = item.fullName ?? ''; _initialized = true; }
          return ListView(padding: const EdgeInsets.all(16), children: [
            CircleAvatar(radius: 34, child: Text((item.fullName ?? item.email).substring(0, 1).toUpperCase())),
            const SizedBox(height: 12),
            Text(item.email, textAlign: TextAlign.center),
            const SizedBox(height: 20),
            TextField(controller: _name, decoration: const InputDecoration(labelText: 'Full name')),
            const SizedBox(height: 12),
            FilledButton.tonal(onPressed: () async { await ref.read(commerceRepositoryProvider).updateProfile(_name.text); ref.invalidate(profileProvider); }, child: const Text('Save profile')),
            ListTile(leading: const Icon(Icons.receipt_long_outlined), title: const Text('Orders'), onTap: () => context.go('/orders')),
            const ListTile(leading: Icon(Icons.info_outline), title: Text('About SneakerLab'), subtitle: Text('Secure demo commerce customer app.')),
            const SizedBox(height: 8),
            FilledButton.tonal(onPressed: () async { await ref.read(authRepositoryProvider).signOut(); ref.read(authSessionProvider.notifier).setUser(null); if (context.mounted) context.go('/login'); }, child: const Text('Sign out')),
          ]);
        },
      ),
    );
  }
}
