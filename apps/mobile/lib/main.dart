import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/config/app_config.dart';
import 'core/routing/app_router.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/auth_repository.dart';
import 'features/auth/auth_session.dart';
import 'features/commerce/commerce_providers.dart';
import 'features/commerce/commerce_repository.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final config = AppConfig.fromEnvironment();
  AuthRepository repository = FakeAuthRepository();
  CommerceRepository commerceRepository = const UnavailableCommerceRepository();

  if (config.hasSupabaseConfiguration) {
    await Supabase.initialize(
      url: config.supabaseUrl,
      publishableKey: config.supabaseAnonKey,
    );
    repository = SupabaseAuthRepository(Supabase.instance.client);
    commerceRepository = SupabaseCommerceRepository(Supabase.instance.client);
  }

  runApp(
    ProviderScope(
      overrides: [
        authRepositoryProvider.overrideWith((ref) => repository),
        commerceRepositoryProvider.overrideWith((ref) => commerceRepository),
      ],
      child: const SneakerLabApp(),
    ),
  );
}

class SneakerLabApp extends ConsumerWidget {
  const SneakerLabApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'SneakerLab',
      theme: sneakerLabTheme(),
      routerConfig: ref.watch(routerProvider),
    );
  }
}
