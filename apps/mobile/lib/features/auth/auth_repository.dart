import 'package:supabase_flutter/supabase_flutter.dart';

abstract class AuthRepository {
  Future<String?> signIn({required String email, required String password});
  Future<String?> register({required String email, required String password, required String fullName});
  Future<String?> requestPasswordReset(String email);
  Future<void> signOut();
}

class SupabaseAuthRepository implements AuthRepository {
  SupabaseAuthRepository(this._client);

  final SupabaseClient _client;

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
  Future<String?> signIn({required String email, required String password}) async => error;

  @override
  Future<String?> register({required String email, required String password, required String fullName}) async => error;

  @override
  Future<String?> requestPasswordReset(String email) async => error;

  @override
  Future<void> signOut() async {}
}
