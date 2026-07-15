import { z } from 'zod';

export const adminUuidSchema = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

export const orderStatusValues = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export type AdminOrderStatus = (typeof orderStatusValues)[number];

const nullableText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .transform((value) => value || null);

const nullableUrl = z
  .string()
  .trim()
  .max(2_048)
  .refine((value) => !value || /^https?:\/\//i.test(value) || value.startsWith('/'), {
    message: 'Use a valid URL or site-relative path.',
  })
  .transform((value) => value || null);

const nullableUuid = z.union([adminUuidSchema, z.literal('')]).transform((value) => value || null);

const variantSchema = z.object({
  id: adminUuidSchema.optional(),
  colorName: z.string().trim().min(1, 'Variant color is required.').max(80),
  colorHex: z
    .string()
    .trim()
    .regex(/^$|^#[0-9a-f]{6}$/i, 'Use a six-character hex color.')
    .transform((value) => value || null),
  size: z.string().trim().min(1, 'Variant size is required.').max(32),
  stock: z.coerce.number().int('Variant stock must be a whole number.').min(0),
  sku: z
    .string()
    .trim()
    .min(1, 'Variant SKU is required.')
    .max(80)
    .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/, 'Use letters, numbers, hyphens, or underscores.'),
});

export type ProductVariantInput = z.infer<typeof variantSchema>;

const productSchema = z
  .object({
    id: z.union([adminUuidSchema, z.literal('')]).transform((value) => value || undefined),
    name: z.string().trim().min(2, 'Product name must contain at least two characters.').max(160),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase words separated by hyphens.')
      .max(180),
    categoryId: nullableUuid,
    shortDescription: nullableText(240),
    description: nullableText(8_000),
    price: z.coerce.number().finite().min(0, 'Price cannot be negative.').max(9_999_999),
    compareAtPrice: z
      .union([z.literal(''), z.coerce.number().finite().min(0)])
      .transform((value) => (value === '' ? null : value)),
    imageUrl: nullableUrl,
    modelUrl: nullableUrl,
    stock: z.coerce
      .number()
      .int('Stock must be a whole number.')
      .min(0, 'Stock cannot be negative.'),
    isFeatured: z.boolean(),
    isActive: z.boolean(),
    variants: z.array(variantSchema).max(100, 'Use 100 variants or fewer.'),
  })
  .superRefine((value, context) => {
    if (value.compareAtPrice !== null && value.compareAtPrice < value.price) {
      context.addIssue({
        code: 'custom',
        path: ['compareAtPrice'],
        message: 'Compare-at price must be greater than or equal to the selling price.',
      });
    }

    const pairs = new Set<string>();
    const skus = new Set<string>();
    for (const [index, variant] of value.variants.entries()) {
      const pair = variant.colorName.toLowerCase() + '::' + variant.size.toLowerCase();
      if (pairs.has(pair)) {
        context.addIssue({
          code: 'custom',
          path: ['variants', index],
          message: 'Each color and size combination must be unique.',
        });
      }
      pairs.add(pair);

      const sku = variant.sku.toLowerCase();
      if (skus.has(sku)) {
        context.addIssue({
          code: 'custom',
          path: ['variants', index],
          message: 'Each variant SKU must be unique.',
        });
      }
      skus.add(sku);
    }
  });

const categorySchema = z.object({
  id: z.union([adminUuidSchema, z.literal('')]).transform((value) => value || undefined),
  name: z.string().trim().min(2, 'Category name must contain at least two characters.').max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase words separated by hyphens.')
    .max(140),
  description: nullableText(1_000),
  imageUrl: nullableUrl,
  isActive: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function formBoolean(formData: FormData, key: string) {
  return formData.get(key) === 'on' || formData.get(key) === 'true';
}

export function slugify(value: string) {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'product';
}

export function parseProductForm(formData: FormData) {
  let variants: unknown = [];
  try {
    variants = JSON.parse(formText(formData, 'variants'));
  } catch {
    return {
      success: false as const,
      error: 'Product variants could not be read. Please add them again.',
    };
  }

  const name = formText(formData, 'name');
  const enteredSlug = formText(formData, 'slug');
  const parsed = productSchema.safeParse({
    id: formText(formData, 'id'),
    name,
    slug: slugify(enteredSlug || name),
    categoryId: formText(formData, 'categoryId'),
    shortDescription: formText(formData, 'shortDescription'),
    description: formText(formData, 'description'),
    price: formText(formData, 'price'),
    compareAtPrice: formText(formData, 'compareAtPrice'),
    imageUrl: formText(formData, 'imageUrl'),
    modelUrl: formText(formData, 'modelUrl'),
    stock: formText(formData, 'stock'),
    isFeatured: formBoolean(formData, 'isFeatured'),
    isActive: formBoolean(formData, 'isActive'),
    variants,
  });
  return parsed.success
    ? parsed
    : {
        success: false as const,
        error: parsed.error.issues[0]?.message ?? 'Check the product form.',
      };
}

export function parseCategoryForm(formData: FormData) {
  const name = formText(formData, 'name');
  const enteredSlug = formText(formData, 'slug');
  const parsed = categorySchema.safeParse({
    id: formText(formData, 'id'),
    name,
    slug: slugify(enteredSlug || name),
    description: formText(formData, 'description'),
    imageUrl: formText(formData, 'imageUrl'),
    isActive: formBoolean(formData, 'isActive'),
  });
  return parsed.success
    ? parsed
    : {
        success: false as const,
        error: parsed.error.issues[0]?.message ?? 'Check the category form.',
      };
}

export function canTransitionOrderStatus(current: AdminOrderStatus, next: AdminOrderStatus) {
  return (
    current === next ||
    (current === 'pending' && (next === 'processing' || next === 'cancelled')) ||
    (current === 'processing' && (next === 'shipped' || next === 'cancelled')) ||
    (current === 'shipped' && next === 'delivered')
  );
}

type UploadFile = Pick<File, 'name' | 'size' | 'type'>;
export type MediaKind = 'image' | 'model';

const imageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const modelMimeTypes = new Set([
  'model/gltf-binary',
  'model/gltf+json',
  'application/octet-stream',
]);

export function validateMediaFile(file: UploadFile, kind: MediaKind) {
  const extension = file.name.toLowerCase().split('.').pop() ?? '';
  const isImage = kind === 'image';
  const maximumSize = isImage ? 5 * 1024 * 1024 : 20 * 1024 * 1024;
  const allowedExtension = isImage
    ? ['jpg', 'jpeg', 'png', 'webp'].includes(extension)
    : ['glb', 'gltf'].includes(extension);
  const allowedType = isImage ? imageMimeTypes.has(file.type) : modelMimeTypes.has(file.type);

  if (!allowedExtension || !allowedType) {
    return {
      success: false as const,
      error: isImage
        ? 'Choose a JPEG, PNG, or WebP image.'
        : 'Choose a supported GLB or glTF model file.',
    };
  }
  if (file.size <= 0 || file.size > maximumSize) {
    return {
      success: false as const,
      error: isImage ? 'Images must be 5 MB or smaller.' : 'Models must be 20 MB or smaller.',
    };
  }
  return { success: true as const, extension };
}

export function safeMediaFilename(fileName: string) {
  const extension = fileName.toLowerCase().split('.').pop() ?? '';
  const stem = fileName
    .replace(/\.[^.]+$/, '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return (stem || 'asset') + '.' + extension;
}

export function buildMediaPath(
  productId: string,
  kind: MediaKind,
  fileName: string,
  uniqueId: string,
) {
  const parsed = adminUuidSchema.safeParse(productId);
  if (!parsed.success) throw new Error('Invalid product id.');
  const folder = kind === 'image' ? 'products' : 'models';
  return folder + '/' + parsed.data + '/' + uniqueId + '-' + safeMediaFilename(fileName);
}

export function getStoragePathFromPublicUrl(
  url: string,
  bucket: 'product-images' | 'product-models',
) {
  const marker = '/object/public/' + bucket + '/';
  const index = url.indexOf(marker);
  if (index < 0) return null;
  const path = decodeURIComponent(url.slice(index + marker.length));
  return path || null;
}
