import 'package:supabase_flutter/supabase_flutter.dart';

abstract class AuthRepository {
  Future<AppUser?> currentUser();
  Future<String?> signIn({required String email, required String password});
  Future<String?> register({required String email, required String password, required String fullName});
  Future<String?> requestPasswordReset(String email);
  Future<void> signOut();
}

class AppUser {
  const AppUser({required this.id, required this.email});
  final String id;
  final String email;
}

class SupabaseAuthRepository implements AuthRepository {
  SupabaseAuthRepository(this._client);

  final SupabaseClient _client;

  @override
  Future<AppUser?> currentUser() async {
    final user = _client.auth.currentUser;
    return user == null ? null : AppUser(id: user.id, email: user.email ?? '');
  }

  @override
  Future<String?> signIn({required String email, required String password}) async {
    try {
      await _client.auth.signInWithPassword(email: email, password: password);
      return null;
    } on AuthException {
      return 'We could not complete that request. Check your details and try again.';
    }
  }

  @override
  Future<String?> register({required String email, required String password, required String fullName}) async {
    try {
      await _client.auth.signUp(email: email, password: password, data: {'full_name': fullName});
      return null;
    } on AuthException {
      return 'We could not complete that request. Check your details and try again.';
    }
  }

  @override
  Future<String?> requestPasswordReset(String email) async {
    try {
      await _client.auth.resetPasswordForEmail(email);
      return null;
    } on AuthException {
      return 'We could not complete that request. Check your details and try again.';
    }
  }

  @override
  Future<void> signOut() => _client.auth.signOut();
}

class FakeAuthRepository implements AuthRepository {
  FakeAuthRepository({this.error});

  final String? error;

  @override
  Future<AppUser?> currentUser() async => null;

  @override
  Future<String?> signIn({required String email, required String password}) async => error;

  @override
  Future<String?> register({required String email, required String password, required String fullName}) async => error;

  @override
  Future<String?> requestPasswordReset(String email) async => error;

  @override
  Future<void> signOut() async {}
}
