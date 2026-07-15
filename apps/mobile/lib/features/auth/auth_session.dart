import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'auth_repository.dart';

class AuthSession extends Notifier<AppUser?> {
  @override
  AppUser? build() => null;

  void setUser(AppUser? value) => state = value;
}

final authSessionProvider = NotifierProvider<AuthSession, AppUser?>(
  AuthSession.new,
);

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => FakeAuthRepository(),
);
