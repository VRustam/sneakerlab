'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getAdminContext } from '@/lib/admin/server';
import {
  adminUuidSchema,
  canTransitionOrderStatus,
  getStoragePathFromPublicUrl,
  orderStatusValues,
  parseCategoryForm,
  parseProductForm,
} from '@/lib/admin/validation';

export interface AdminActionResult {
  error?: string;
  success?: string;
  productId?: string;
  redirectTo?: string;
  storagePath?: string | null;
}

function safeDatabaseError(context: string) {
  return 'We could not ' + context + '. Please check the form and try again.';
}

function revalidateAdminCatalog() {
  revalidatePath('/admin');
  revalidatePath('/admin/products');
  revalidatePath('/products');
}

async function requireAdminAction(): Promise<
  | { success: true; context: NonNullable<Awaited<ReturnType<typeof getAdminContext>>> }
  | { success: false; result: AdminActionResult }
> {
  const context = await getAdminContext();
  if (!context) {
    return {
      success: false,
      result: { error: 'This action requires an authenticated admin account.' },
    };
  }
  return { success: true, context };
}

function parseId(formData: FormData, key = 'id') {
  return adminUuidSchema.safeParse(formData.get(key));
}

export async function saveProductAction(formData: FormData): Promise<AdminActionResult> {
  const access = await requireAdminAction();
  if (!access.success) return access.result;

  const parsed = parseProductForm(formData);
  if (!parsed.success) return { error: parsed.error };
  const { client } = access.context;
  const input = parsed.data;

  const { data: collision, error: collisionError } = await client
    .from('products')
    .select('id')
    .eq('slug', input.slug)
    .maybeSingle();
  if (collisionError) return { error: safeDatabaseError('check that product slug') };
  if (collision && collision.id !== input.id) {
    return { error: 'That product slug is already in use. Choose a different one.' };
  }

  const productValues = {
    category_id: input.categoryId,
    name: input.name,
    slug: input.slug,
    short_description: input.shortDescription,
    description: input.description,
    price: input.price,
    compare_at_price: input.compareAtPrice,
    image_url: input.imageUrl,
    model_3d_url: input.modelUrl,
    stock: input.stock,
    is_featured: input.isFeatured,
    is_active: input.isActive,
  };

  let productId = input.id;
  if (productId) {
    const { data, error } = await client
      .from('products')
      .update(productValues)
      .eq('id', productId)
      .select('id')
      .maybeSingle();
    if (error || !data) return { error: safeDatabaseError('update that product') };
  } else {
    const { data, error } = await client
      .from('products')
      .insert(productValues)
      .select('id')
      .single();
    if (error || !data) return { error: safeDatabaseError('create that product') };
    productId = data.id;
  }

  const { data: currentVariants, error: currentVariantsError } = await client
    .from('product_variants')
    .select('id')
    .eq('product_id', productId);
  if (currentVariantsError) return { error: safeDatabaseError('load product variants') };

  const existingIds = new Set((currentVariants ?? []).map((variant) => variant.id));
  const keptIds = new Set<string>();
  for (const variant of input.variants) {
    const values = {
      color_name: variant.colorName,
      color_hex: variant.colorHex,
      size: variant.size,
      stock: variant.stock,
      sku: variant.sku,
    };
    if (variant.id) {
      if (!existingIds.has(variant.id)) {
        return { error: 'One of the selected variants no longer belongs to this product.' };
      }
      const { error } = await client
        .from('product_variants')
        .update(values)
        .eq('id', variant.id)
        .eq('product_id', productId);
      if (error) return { error: safeDatabaseError('update product variants') };
      keptIds.add(variant.id);
    } else {
      const { error } = await client.from('product_variants').insert({
        product_id: productId,
        ...values,
      });
      if (error) return { error: safeDatabaseError('add product variants') };
    }
  }

  const removedIds = [...existingIds].filter((id) => !keptIds.has(id));
  if (removedIds.length > 0) {
    const { error } = await client.from('product_variants').delete().in('id', removedIds);
    if (error) return { error: safeDatabaseError('remove product variants') };
  }

  revalidateAdminCatalog();
  revalidatePath('/admin/products/' + productId + '/edit');
  revalidatePath('/products/' + input.slug);
  return {
    success: input.id ? 'Product saved.' : 'Product created. Add media from the edit view.',
    productId,
    redirectTo: input.id ? undefined : '/admin/products/' + productId + '/edit',
  };
}

export async function setProductActiveAction(formData: FormData): Promise<AdminActionResult> {
  const access = await requireAdminAction();
  if (!access.success) return access.result;
  const id = parseId(formData);
  if (!id.success) return { error: 'That product is no longer valid.' };
  const isActive = formData.get('isActive') === 'true';
  const { error } = await access.context.client
    .from('products')
    .update({ is_active: isActive })
    .eq('id', id.data);
  if (error)
    return {
      error: safeDatabaseError(isActive ? 'activate that product' : 'deactivate that product'),
    };
  revalidateAdminCatalog();
  revalidatePath('/admin/products/' + id.data + '/edit');
  return { success: isActive ? 'Product activated.' : 'Product deactivated.' };
}

export async function saveCategoryAction(formData: FormData): Promise<AdminActionResult> {
  const access = await requireAdminAction();
  if (!access.success) return access.result;
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) return { error: parsed.error };
  const input = parsed.data;
  const { client } = access.context;

  const { data: collision, error: collisionError } = await client
    .from('categories')
    .select('id')
    .eq('slug', input.slug)
    .maybeSingle();
  if (collisionError) return { error: safeDatabaseError('check that category slug') };
  if (collision && collision.id !== input.id) {
    return { error: 'That category slug is already in use. Choose a different one.' };
  }

  const values = {
    name: input.name,
    slug: input.slug,
    description: input.description,
    image_url: input.imageUrl,
    is_active: input.isActive,
  };
  const result = input.id
    ? await client.from('categories').update(values).eq('id', input.id)
    : await client.from('categories').insert(values);
  if (result.error)
    return { error: safeDatabaseError(input.id ? 'update that category' : 'create that category') };

  revalidatePath('/admin/categories');
  revalidatePath('/products');
  return { success: input.id ? 'Category saved.' : 'Category created.' };
}

export async function addProductImageAction(formData: FormData): Promise<AdminActionResult> {
  const access = await requireAdminAction();
  if (!access.success) return access.result;
  const productId = parseId(formData, 'productId');
  const imageUrl = z.string().url().max(2_048).safeParse(formData.get('imageUrl'));
  const altText = z
    .string()
    .trim()
    .max(240)
    .safeParse(formData.get('altText') ?? '');
  if (!productId.success || !imageUrl.success || !altText.success) {
    return { error: 'The uploaded image reference is not valid.' };
  }
  const { client } = access.context;
  const { data: images, error: imagesError } = await client
    .from('product_images')
    .select('sort_order')
    .eq('product_id', productId.data)
    .order('sort_order', { ascending: false })
    .limit(1);
  if (imagesError) return { error: safeDatabaseError('prepare that image') };
  const nextSortOrder = (images?.[0]?.sort_order ?? -1) + 1;
  const { error } = await client.from('product_images').insert({
    product_id: productId.data,
    image_url: imageUrl.data,
    alt_text: altText.data || null,
    sort_order: nextSortOrder,
  });
  if (error) return { error: safeDatabaseError('save that image') };

  const { data: product, error: productError } = await client
    .from('products')
    .select('image_url')
    .eq('id', productId.data)
    .maybeSingle();
  if (!productError && product && !product.image_url) {
    await client.from('products').update({ image_url: imageUrl.data }).eq('id', productId.data);
  }
  revalidateAdminCatalog();
  revalidatePath('/admin/products/' + productId.data + '/edit');
  return { success: 'Product image added.' };
}

export async function reorderProductImagesAction(formData: FormData): Promise<AdminActionResult> {
  const access = await requireAdminAction();
  if (!access.success) return access.result;
  const productId = parseId(formData, 'productId');
  if (!productId.success) return { error: 'That product is no longer valid.' };

  let orderedIds: unknown = [];
  try {
    orderedIds = JSON.parse(String(formData.get('imageIds') ?? '[]'));
  } catch {
    return { error: 'Image order could not be read safely.' };
  }
  const parsedIds = z.array(adminUuidSchema).min(1).max(100).safeParse(orderedIds);
  if (!parsedIds.success || new Set(parsedIds.data).size !== parsedIds.data.length) {
    return { error: 'Use a valid unique image order.' };
  }
  const { client } = access.context;
  const { data: current, error: currentError } = await client
    .from('product_images')
    .select('id')
    .eq('product_id', productId.data);
  if (currentError || (current ?? []).length !== parsedIds.data.length) {
    return { error: 'Product images changed before they could be reordered.' };
  }
  const currentIds = new Set((current ?? []).map((image) => image.id));
  if (parsedIds.data.some((id) => !currentIds.has(id))) {
    return { error: 'Product images changed before they could be reordered.' };
  }

  for (const [index, id] of parsedIds.data.entries()) {
    const { error } = await client
      .from('product_images')
      .update({ sort_order: 10_000 + index })
      .eq('id', id)
      .eq('product_id', productId.data);
    if (error) return { error: safeDatabaseError('stage image order') };
  }
  for (const [index, id] of parsedIds.data.entries()) {
    const { error } = await client
      .from('product_images')
      .update({ sort_order: index })
      .eq('id', id)
      .eq('product_id', productId.data);
    if (error) return { error: safeDatabaseError('save image order') };
  }
  revalidateAdminCatalog();
  revalidatePath('/admin/products/' + productId.data + '/edit');
  return { success: 'Image order saved.' };
}

export async function deleteProductImageAction(formData: FormData): Promise<AdminActionResult> {
  const access = await requireAdminAction();
  if (!access.success) return access.result;
  const productId = parseId(formData, 'productId');
  const imageId = parseId(formData, 'imageId');
  if (!productId.success || !imageId.success) return { error: 'That image is no longer valid.' };
  const { client } = access.context;
  const { data: image, error: imageError } = await client
    .from('product_images')
    .select('id, image_url')
    .eq('id', imageId.data)
    .eq('product_id', productId.data)
    .maybeSingle();
  if (imageError || !image) return { error: 'That image is no longer available.' };
  const { error } = await client
    .from('product_images')
    .delete()
    .eq('id', image.id)
    .eq('product_id', productId.data);
  if (error) return { error: safeDatabaseError('remove that image') };

  const [{ data: product }, { data: remaining }] = await Promise.all([
    client.from('products').select('image_url').eq('id', productId.data).maybeSingle(),
    client
      .from('product_images')
      .select('image_url')
      .eq('product_id', productId.data)
      .order('sort_order')
      .limit(1),
  ]);
  if (product?.image_url === image.image_url) {
    await client
      .from('products')
      .update({ image_url: remaining?.[0]?.image_url ?? null })
      .eq('id', productId.data);
  }
  revalidateAdminCatalog();
  revalidatePath('/admin/products/' + productId.data + '/edit');
  return {
    success: 'Product image removed.',
    storagePath: getStoragePathFromPublicUrl(image.image_url, 'product-images'),
  };
}

export async function setProductModelAction(formData: FormData): Promise<AdminActionResult> {
  const access = await requireAdminAction();
  if (!access.success) return access.result;
  const productId = parseId(formData, 'productId');
  const modelUrl = z
    .string()
    .trim()
    .max(2_048)
    .refine((value) => !value || /^https?:\/\//i.test(value) || value.startsWith('/'))
    .safeParse(formData.get('modelUrl') ?? '');
  if (!productId.success || !modelUrl.success)
    return { error: 'That model reference is not valid.' };
  const { error } = await access.context.client
    .from('products')
    .update({ model_3d_url: modelUrl.data || null })
    .eq('id', productId.data);
  if (error) return { error: safeDatabaseError('update that model') };
  revalidateAdminCatalog();
  revalidatePath('/admin/products/' + productId.data + '/edit');
  return { success: modelUrl.data ? '3D model linked.' : '3D model removed.' };
}

export async function updateOrderStatusAction(formData: FormData): Promise<AdminActionResult> {
  const access = await requireAdminAction();
  if (!access.success) return access.result;
  const orderId = parseId(formData, 'orderId');
  const status = z.enum(orderStatusValues).safeParse(formData.get('status'));
  if (!orderId.success || !status.success) return { error: 'Choose a valid order status.' };
  const { client } = access.context;
  const { data: order, error: orderError } = await client
    .from('orders')
    .select('id, status')
    .eq('id', orderId.data)
    .maybeSingle();
  if (orderError || !order) return { error: 'That order is no longer available.' };
  if (!canTransitionOrderStatus(order.status, status.data)) {
    return { error: 'That status transition is not allowed.' };
  }
  const { error } = await client.from('orders').update({ status: status.data }).eq('id', order.id);
  if (error) return { error: safeDatabaseError('update that order status') };
  revalidatePath('/admin');
  revalidatePath('/admin/orders');
  revalidatePath('/admin/orders/' + order.id);
  return { success: 'Order status updated.' };
}
