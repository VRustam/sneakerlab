import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'auth_repository.dart';

class AuthSession extends Notifier<bool> {
  @override
  bool build() => false;

  void setAuthenticated(bool value) => state = value;
}

final authSessionProvider = NotifierProvider<AuthSession, bool>(AuthSession.new);

final authRepositoryProvider = Provider<AuthRepository>((ref) => FakeAuthRepository());
