class ProductCategory {
  const ProductCategory({
    required this.id,
    required this.name,
    required this.slug,
  });

  final String id;
  final String name;
  final String slug;

  factory ProductCategory.fromMap(Map<String, dynamic> row) => ProductCategory(
    id: row['id'] as String,
    name: row['name'] as String,
    slug: row['slug'] as String,
  );
}

class ProductVariant {
  const ProductVariant({
    required this.id,
    required this.colorName,
    required this.size,
    required this.stock,
    required this.sku,
    this.colorHex,
  });

  final String id;
  final String colorName;
  final String size;
  final int stock;
  final String sku;
  final String? colorHex;

  factory ProductVariant.fromMap(Map<String, dynamic> row) => ProductVariant(
    id: row['id'] as String,
    colorName: row['color_name'] as String,
    size: row['size'] as String,
    stock: row['stock'] as int,
    sku: row['sku'] as String,
    colorHex: row['color_hex'] as String?,
  );
}

class Product {
  const Product({
    required this.id,
    required this.name,
    required this.slug,
    required this.price,
    required this.stock,
    required this.isFeatured,
    required this.imageUrl,
    this.shortDescription,
    this.description,
    this.category,
    this.images = const [],
    this.variants = const [],
    this.modelUrl,
  });

  final String id;
  final String name;
  final String slug;
  final double price;
  final int stock;
  final bool isFeatured;
  final String? imageUrl;
  final String? shortDescription;
  final String? description;
  final ProductCategory? category;
  final List<String> images;
  final List<ProductVariant> variants;
  final String? modelUrl;

  bool get isInStock => variants.isEmpty
      ? stock > 0
      : variants.any((variant) => variant.stock > 0);

  factory Product.fromMap(
    Map<String, dynamic> row, {
    ProductCategory? category,
    List<String> images = const [],
    List<ProductVariant> variants = const [],
  }) => Product(
    id: row['id'] as String,
    name: row['name'] as String,
    slug: row['slug'] as String,
    price: (row['price'] as num).toDouble(),
    stock: row['stock'] as int,
    isFeatured: row['is_featured'] as bool? ?? false,
    imageUrl: row['image_url'] as String?,
    shortDescription: row['short_description'] as String?,
    description: row['description'] as String?,
    category: category,
    images: images,
    variants: variants,
    modelUrl: row['model_3d_url'] as String?,
  );
}

class CartLine {
  const CartLine({
    required this.id,
    required this.product,
    required this.quantity,
    this.variant,
  });

  final String id;
  final Product product;
  final ProductVariant? variant;
  final int quantity;

  int get availableStock => variant?.stock ?? product.stock;
  double get total => product.price * quantity;
}

class CustomerOrder {
  const CustomerOrder({
    required this.id,
    required this.number,
    required this.total,
    required this.status,
    required this.createdAt,
    this.items = const [],
  });

  final String id;
  final String number;
  final double total;
  final String status;
  final DateTime createdAt;
  final List<OrderItem> items;
}

class OrderItem {
  const OrderItem({
    required this.id,
    required this.name,
    required this.quantity,
    required this.total,
    this.imageUrl,
    this.size,
    this.color,
  });

  final String id;
  final String name;
  final int quantity;
  final double total;
  final String? imageUrl;
  final String? size;
  final String? color;
}

class CustomerProfile {
  const CustomerProfile({required this.email, this.fullName, this.avatarPath});

  final String email;
  final String? fullName;
  final String? avatarPath;
}

class CatalogFilter {
  const CatalogFilter({
    this.query = '',
    this.categorySlug,
    this.sort = CatalogSort.newest,
    this.maximumPrice,
    this.page = 0,
  });

  final String query;
  final String? categorySlug;
  final CatalogSort sort;
  final double? maximumPrice;
  final int page;

  CatalogFilter copyWith({
    String? query,
    String? categorySlug,
    bool clearCategory = false,
    CatalogSort? sort,
    double? maximumPrice,
    bool clearMaximumPrice = false,
    int? page,
  }) => CatalogFilter(
    query: query ?? this.query,
    categorySlug: clearCategory ? null : categorySlug ?? this.categorySlug,
    sort: sort ?? this.sort,
    maximumPrice: clearMaximumPrice ? null : maximumPrice ?? this.maximumPrice,
    page: page ?? this.page,
  );
}

enum CatalogSort { newest, priceLowToHigh, priceHighToLow }
