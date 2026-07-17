import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../commerce/commerce_providers.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});
  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _address = TextEditingController();
  final _couponCode = TextEditingController();
  bool _loading = false;
  String? _message;
  
  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _address.dispose();
    _couponCode.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _loading = true;
      _message = null;
    });
    try {
      final micro = DateTime.now().microsecondsSinceEpoch % 1000000000000;
      final order = await ref
          .read(commerceRepositoryProvider)
          .checkout(
            name: _name.text.trim(),
            email: _email.text.trim(),
            address: {
              'addressLine1': _address.text.trim(),
              'addressLine2': '',
              'city': 'Not specified',
              'region': 'Not specified',
              'postalCode': '00000',
              'country': 'Not specified',
            },
            idempotencyKey:
                '00000000-0000-4000-8000-${micro.toString().padLeft(12, '0')}',
            couponCode: _couponCode.text.trim().isNotEmpty
                ? _couponCode.text.trim().toUpperCase()
                : null,
          );
      ref.invalidate(cartProvider);
      ref.invalidate(ordersProvider);
      if (mounted) {
        context.go('/orders/${order.number}');
      }
    } catch (e) {
      if (mounted) {
        String displayError = 'Demo checkout could not be completed. Your cart is still available to review.';
        if (e is PostgrestException) {
          displayError = e.message;
        } else if (e.toString().contains('Exception:')) {
          displayError = e.toString().substring(e.toString().indexOf('Exception:') + 10).trim();
        }
        setState(() => _message = displayError);
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Demo checkout')),
    body: Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text(
            'No real payment will be charged. Prices and stock are calculated securely in the database.',
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _name,
            decoration: const InputDecoration(labelText: 'Contact name'),
            validator: (value) => value == null || value.trim().isEmpty
                ? 'Enter your name.'
                : null,
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _email,
            decoration: const InputDecoration(labelText: 'Email address'),
            keyboardType: TextInputType.emailAddress,
            validator: (value) => value == null || !value.contains('@')
                ? 'Enter a valid email address.'
                : null,
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _address,
            decoration: const InputDecoration(labelText: 'Address line 1'),
            validator: (value) => value == null || value.trim().isEmpty
                ? 'Enter your address.'
                : null,
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _couponCode,
            decoration: const InputDecoration(
              labelText: 'Promo code (optional)',
              hintText: 'e.g. SAVE20',
            ),
            textCapitalization: TextCapitalization.characters,
          ),
          if (_message != null)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(
                _message!,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            ),
          const SizedBox(height: 20),
          FilledButton(
            onPressed: _loading ? null : _submit,
            child: Text(_loading ? 'Placing order…' : 'Place demo order'),
          ),
        ],
      ),
    ),
  );
}
