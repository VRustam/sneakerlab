import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/widgets/app_scaffold.dart';
import '../auth/auth_session.dart';

class AccountScreen extends ConsumerWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return AppScaffold(
      title: 'Account',
      location: '/account',
      body: Center(
        child: FilledButton.tonal(
          onPressed: () {
            ref.read(authSessionProvider.notifier).setAuthenticated(false);
            context.go('/login');
          },
          child: const Text('Sign out'),
        ),
      ),
    );
  }
}
