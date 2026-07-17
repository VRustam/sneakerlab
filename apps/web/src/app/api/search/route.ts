import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const searchTerm = query.replace(/[%,()]/g, ' ').trim().slice(0, 120);
  if (!searchTerm) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ results: [] });
  }

  // Search products with ilike across name, short_description, description
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, price, image_url, short_description, category_id')
    .eq('is_active', true)
    .or(
      `name.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`,
    )
    .order('is_featured', { ascending: false })
    .order('name')
    .limit(8);

  if (error) {
    return NextResponse.json({ results: [] }, { status: 500 });
  }

  // Hydrate category names
  const categoryIds = Array.from(
    new Set((products ?? []).flatMap((p) => (p.category_id ? [p.category_id] : []))),
  );
  let categoryMap = new Map<string, string>();
  if (categoryIds.length > 0) {
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .in('id', categoryIds);
    categoryMap = new Map((categories ?? []).map((c) => [c.id, c.name]));
  }

  const results = (products ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image_url: product.image_url,
    short_description: product.short_description,
    category_name: product.category_id ? (categoryMap.get(product.category_id) ?? null) : null,
  }));

  return NextResponse.json({ results });
}
