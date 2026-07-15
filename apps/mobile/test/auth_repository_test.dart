import 'package:flutter_test/flutter_test.dart';
import 'package:sneakerlab_mobile/features/auth/auth_repository.dart';

void main() {
  test('fake auth repository has no persisted default session', () async {
    final repository = FakeAuthRepository();

    expect(await repository.currentUser(), isNull);
    expect(
      await repository.signIn(
        email: 'customer@example.com',
        password: 'password123',
      ),
      isNull,
    );
  });

  test('fake auth repository returns its safe configured error', () async {
    final repository = FakeAuthRepository(error: 'Try again later.');

    expect(
      await repository.requestPasswordReset('customer@example.com'),
      'Try again later.',
    );
  });
}
