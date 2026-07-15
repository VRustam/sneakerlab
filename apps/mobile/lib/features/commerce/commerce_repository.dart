import 'package:supabase_flutter/supabase_flutter.dart';

import 'commerce_models.dart';

abstract class CommerceRepository {
  Future<List<ProductCategory>> categories();
  Future<List<Product>> products(CatalogFilter filter);
  Future<Product?> productBySlug(String slug);
  Future<Set<String>> favoriteIds();
  Future<List<Product>> favoriteProducts();
  Future<void> setFavorite(String productId, bool isFavorite);
  Future<List<CartLine>> cart();
  Future<void> addCartLine(String productId, String? variantId);
  Future<void> updateCartLine(String lineId, int quantity);
  Future<void> removeCartLine(String lineId);
  Future<CustomerOrder> checkout({
    required String name,
    required String email,
    required Map<String, String> address,
    required String idempotencyKey,
  });
  Future<List<CustomerOrder>> orders();
  Future<CustomerOrder?> orderByNumber(String number);
  Future<CustomerProfile> profile();
  Future<void> updateProfile(String fullName);
}

class SupabaseCommerceRepository implements CommerceRepository {
  SupabaseCommerceRepository(this._client);

  final SupabaseClient _client;

  static const _productFields =
      'id,category_id,name,slug,short_description,description,price,image_url,'
      'model_3d_url,stock,is_featured';

  @override
  Future<List<ProductCategory>> categories() async {
    final rows = await _client
        .from('categories')
        .select('id,name,slug')
        .eq('is_active', true)
        .order('name');
    return rows.map(ProductCategory.fromMap).toList();
  }

  @override
  Future<List<Product>> products(CatalogFilter filter) async {
    var query = _client
        .from('products')
        .select(_productFields)
        .eq('is_active', true);
    if (filter.query.trim().isNotEmpty) {
      final value = filter.query.replaceAll(RegExp(r'[%(),]'), ' ').trim();
      query = query.or('name.ilike.%$value%,short_description.ilike.%$value%');
    }
    if (filter.maximumPrice != null) {
      query = query.lte('price', filter.maximumPrice!);
    }

    final categoryRows = await categories();
    final categoryById = {
      for (final category in categoryRows) category.id: category,
    };
    if (filter.categorySlug != null) {
      ProductCategory? selectedCategory;
      for (final category in categoryById.values) {
        if (category.slug == filter.categorySlug) {
          selectedCategory = category;
          break;
        }
      }
      if (selectedCategory == null) return const [];
      query = query.eq('category_id', selectedCategory.id);
    }

    final orderedQuery = switch (filter.sort) {
      CatalogSort.priceLowToHigh => query.order('price'),
      CatalogSort.priceHighToLow => query.order('price', ascending: false),
      CatalogSort.newest => query.order('created_at', ascending: false),
    };
    final rows = await orderedQuery.range(
      filter.page * 20,
      filter.page * 20 + 19,
    );
    return rows
        .map(
          (row) =>
              Product.fromMap(row, category: categoryById[row['category_id']]),
        )
        .toList();
  }

  @override
  Future<Product?> productBySlug(String slug) async {
    final row = await _client
        .from('products')
        .select(_productFields)
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();
    if (row == null) return null;

    final productId = row['id'] as String;
    final results = await Future.wait([
      _client
          .from('categories')
          .select('id,name,slug')
          .eq('id', row['category_id'])
          .maybeSingle(),
      _client
          .from('product_images')
          .select('image_url')
          .eq('product_id', productId)
          .order('sort_order'),
      _client
          .from('product_variants')
          .select('id,color_name,color_hex,size,stock,sku')
          .eq('product_id', productId)
          .order('sku'),
    ]);
    final categoryRow = results[0] as Map<String, dynamic>?;
    final category = categoryRow == null
        ? null
        : ProductCategory.fromMap(categoryRow);
    final images = (results[1] as List<Map<String, dynamic>>)
        .map((item) => item['image_url'] as String)
        .toList();
    final variants = (results[2] as List<Map<String, dynamic>>)
        .map(ProductVariant.fromMap)
        .toList();
    return Product.fromMap(
      row,
      category: category,
      images: images,
      variants: variants,
    );
  }

  String _userId() {
    final id = _client.auth.currentUser?.id;
    if (id == null) throw const AuthException('Authentication is required.');
    return id;
  }

  @override
  Future<Set<String>> favoriteIds() async {
    final rows = await _client
        .from('favorites')
        .select('product_id')
        .eq('user_id', _userId());
    return rows.map((row) => row['product_id'] as String).toSet();
  }

  @override
  Future<List<Product>> favoriteProducts() async {
    final ids = await favoriteIds();
    if (ids.isEmpty) return const [];
    final rows = await _client
        .from('products')
        .select(_productFields)
        .eq('is_active', true)
        .inFilter('id', ids.toList())
        .order('created_at', ascending: false);
    return rows.map(Product.fromMap).toList();
  }

  @override
  Future<void> setFavorite(String productId, bool isFavorite) async {
    final userId = _userId();
    if (isFavorite) {
      await _client.from('favorites').insert({
        'user_id': userId,
        'product_id': productId,
      });
      return;
    }
    await _client
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
  }

  @override
  Future<List<CartLine>> cart() async {
    final rows = await _client
        .from('cart_items')
        .select(
          'id,quantity,product_id,product_variant_id,'
          'products(id,name,slug,price,image_url,stock,is_featured),'
          'product_variants(id,color_name,color_hex,size,stock,sku)',
        )
        .eq('user_id', _userId())
        .order('updated_at', ascending: false);
    return rows.map((row) {
      final product = Product.fromMap(row['products'] as Map<String, dynamic>);
      final variantRow = row['product_variants'] as Map<String, dynamic>?;
      return CartLine(
        id: row['id'] as String,
        product: product,
        quantity: row['quantity'] as int,
        variant: variantRow == null ? null : ProductVariant.fromMap(variantRow),
      );
    }).toList();
  }

  @override
  Future<void> addCartLine(String productId, String? variantId) async {
    final userId = _userId();
    final existing = variantId == null
        ? await _client
              .from('cart_items')
              .select('id,quantity')
              .eq('user_id', userId)
              .eq('product_id', productId)
              .isFilter('product_variant_id', null)
              .maybeSingle()
        : await _client
              .from('cart_items')
              .select('id,quantity')
              .eq('user_id', userId)
              .eq('product_id', productId)
              .eq('product_variant_id', variantId)
              .maybeSingle();
    if (existing == null) {
      await _client.from('cart_items').insert({
        'user_id': userId,
        'product_id': productId,
        'product_variant_id': variantId,
        'quantity': 1,
      });
      return;
    }
    await _client
        .from('cart_items')
        .update({'quantity': (existing['quantity'] as int) + 1})
        .eq('id', existing['id'] as String)
        .eq('user_id', userId);
  }

  @override
  Future<void> updateCartLine(String lineId, int quantity) async {
    if (quantity <= 0) return removeCartLine(lineId);
    await _client
        .from('cart_items')
        .update({'quantity': quantity})
        .eq('id', lineId)
        .eq('user_id', _userId());
  }

  @override
  Future<void> removeCartLine(String lineId) => _client
      .from('cart_items')
      .delete()
      .eq('id', lineId)
      .eq('user_id', _userId());

  @override
  Future<CustomerOrder> checkout({
    required String name,
    required String email,
    required Map<String, String> address,
    required String idempotencyKey,
  }) async {
    final orderId =
        await _client.rpc(
              'create_order_from_cart',
              params: {
                'p_customer_name': name,
                'p_customer_email': email,
                'p_shipping_address': address,
                'p_shipping_cost': 0,
                'p_idempotency_key': idempotencyKey,
              },
            )
            as String;
    final row = await _client
        .from('orders')
        .select('id,order_number,total,status,created_at')
        .eq('id', orderId)
        .single();
    return _orderFromMap(row);
  }

  CustomerOrder _orderFromMap(
    Map<String, dynamic> row, {
    List<OrderItem> items = const [],
  }) => CustomerOrder(
    id: row['id'] as String,
    number: row['order_number'] as String,
    total: (row['total'] as num).toDouble(),
    status: row['status'] as String,
    createdAt: DateTime.parse(row['created_at'] as String),
    items: items,
  );

  @override
  Future<List<CustomerOrder>> orders() async {
    final rows = await _client
        .from('orders')
        .select('id,order_number,total,status,created_at')
        .eq('user_id', _userId())
        .order('created_at', ascending: false);
    return rows.map(_orderFromMap).toList();
  }

  @override
  Future<CustomerOrder?> orderByNumber(String number) async {
    final order = await _client
        .from('orders')
        .select('id,order_number,total,status,created_at')
        .eq('user_id', _userId())
        .eq('order_number', number)
        .maybeSingle();
    if (order == null) return null;
    final items = await _client
        .from('order_items')
        .select(
          'id,product_name,quantity,total_price,product_image_url,'
          'selected_size,selected_color',
        )
        .eq('order_id', order['id'] as String);
    return _orderFromMap(
      order,
      items: items
          .map(
            (item) => OrderItem(
              id: item['id'] as String,
              name: item['product_name'] as String,
              quantity: item['quantity'] as int,
              total: (item['total_price'] as num).toDouble(),
              imageUrl: item['product_image_url'] as String?,
              size: item['selected_size'] as String?,
              color: item['selected_color'] as String?,
            ),
          )
          .toList(),
    );
  }

  @override
  Future<CustomerProfile> profile() async {
    final user = _client.auth.currentUser;
    if (user == null) throw const AuthException('Authentication is required.');
    final row = await _client
        .from('profiles')
        .select('full_name,avatar_url')
        .eq('id', user.id)
        .maybeSingle();
    return CustomerProfile(
      email: user.email ?? '',
      fullName: row?['full_name'] as String?,
      avatarPath: row?['avatar_url'] as String?,
    );
  }

  @override
  Future<void> updateProfile(String fullName) => _client
      .from('profiles')
      .update({'full_name': fullName.trim()})
      .eq('id', _userId());
}

class UnavailableCommerceRepository implements CommerceRepository {
  const UnavailableCommerceRepository();

  Never _unavailable() => throw StateError(
    'Supabase is not configured. Add only URL and anon key with '
    '--dart-define.',
  );

  @override
  Future<List<ProductCategory>> categories() async => _unavailable();

  @override
  Future<List<Product>> products(CatalogFilter filter) async => _unavailable();

  @override
  Future<Product?> productBySlug(String slug) async => _unavailable();

  @override
  Future<Set<String>> favoriteIds() async => _unavailable();

  @override
  Future<List<Product>> favoriteProducts() async => _unavailable();

  @override
  Future<void> setFavorite(String productId, bool isFavorite) async =>
      _unavailable();

  @override
  Future<List<CartLine>> cart() async => _unavailable();

  @override
  Future<void> addCartLine(String productId, String? variantId) async =>
      _unavailable();

  @override
  Future<void> updateCartLine(String lineId, int quantity) async =>
      _unavailable();

  @override
  Future<void> removeCartLine(String lineId) async => _unavailable();

  @override
  Future<CustomerOrder> checkout({
    required String name,
    required String email,
    required Map<String, String> address,
    required String idempotencyKey,
  }) async => _unavailable();

  @override
  Future<List<CustomerOrder>> orders() async => _unavailable();

  @override
  Future<CustomerOrder?> orderByNumber(String number) async => _unavailable();

  @override
  Future<CustomerProfile> profile() async => _unavailable();

  @override
  Future<void> updateProfile(String fullName) async => _unavailable();
}
