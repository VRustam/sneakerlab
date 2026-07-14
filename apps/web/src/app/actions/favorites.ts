'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSafeFavoriteReturnPath } from '@/lib/catalog/favorite-path';
import { SupabaseCatalogRepository } from '@/lib/catalog/catalog-repository';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function toggleFavoriteAction(formData: FormData) {
  const returnPath = getSafeFavoriteReturnPath(formData.get('returnPath'));
  const productId = formData.get('productId');
  if (typeof productId !== 'string' || !uuidPattern.test(productId)) return;

  const client = await getSupabaseServerClient();
  if (!client) redirect(`/login?next=${encodeURIComponent(returnPath)}`);

  const { data, error } = await client.auth.getUser();
  if (error || !data.user) redirect(`/login?next=${encodeURIComponent(returnPath)}`);

  const repository = new SupabaseCatalogRepository(client);
  const favoriteIds = await repository.getFavoriteProductIds(data.user.id);
  await repository.toggleFavorite(data.user.id, productId, favoriteIds.has(productId));

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/favorites');
  revalidatePath(returnPath);
}
