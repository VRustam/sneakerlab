import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sneakerlab_mobile/features/auth/auth_repository.dart';
import 'package:sneakerlab_mobile/features/auth/auth_session.dart';
import 'package:sneakerlab_mobile/features/auth/login_screen.dart';

void main() {
  testWidgets('renders login and validates email and password', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [authRepositoryProvider.overrideWith((ref) => FakeAuthRepository())],
        child: const MaterialApp(home: LoginScreen()),
      ),
    );

    expect(find.text('Welcome back'), findsOneWidget);
    await tester.tap(find.text('Sign in'));
    await tester.pump();
    expect(find.text('Enter a valid email address.'), findsOneWidget);
    expect(find.text('Use at least 8 characters.'), findsOneWidget);
  });
}
