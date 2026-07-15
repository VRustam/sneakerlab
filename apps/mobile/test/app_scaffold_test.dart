import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:sneakerlab_mobile/core/widgets/app_scaffold.dart';

void main() {
  testWidgets('shows the selected bottom navigation destination', (tester) async {
    final router = GoRouter(routes: [GoRoute(path: '/', builder: (context, state) => const AppScaffold(title: 'Home', location: '/', body: Text('Home body')))]);
    await tester.pumpWidget(MaterialApp.router(routerConfig: router));

    expect(
      find.descendant(
        of: find.byType(NavigationBar),
        matching: find.text('Home'),
      ),
      findsOneWidget,
    );
    expect(find.text('Shop'), findsOneWidget);
    expect(find.text('Favorites'), findsOneWidget);
    expect(find.text('Cart'), findsOneWidget);
    expect(find.text('Account'), findsOneWidget);
  });
}
