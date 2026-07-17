import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

async function getProductContext(supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>) {
  const { data: products } = await supabase
    .from('products')
    .select('name, slug, price, compare_at_price, short_description, stock, is_featured')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .limit(50);

  const { data: categories } = await supabase
    .from('categories')
    .select('name, slug')
    .eq('is_active', true);

  return { products: products ?? [], categories: categories ?? [] };
}

function buildSystemPrompt(products: { name: string; slug: string; price: number; compare_at_price: number | null; short_description: string | null; stock: number; is_featured: boolean }[], categories: { name: string; slug: string }[]) {
  const productList = products
    .map(
      (p) =>
        `- ${p.name} ($${p.price}${p.compare_at_price ? `, was $${p.compare_at_price}` : ''}) — ${p.short_description ?? 'Premium sneaker'} [/products/${p.slug}]${p.stock <= 3 ? ' ⚠️ Low stock!' : ''}${p.is_featured ? ' ⭐ Featured' : ''}`,
    )
    .join('\n');

  const categoryList = categories.map((c) => `- ${c.name} [/products?category=${c.slug}]`).join('\n');

  return `You are SneakerLab AI — a friendly, knowledgeable sneaker shopping assistant.

ROLE: Help customers find the perfect sneakers by understanding their needs (style, budget, activity) and recommending products from our catalog.

PERSONALITY:
- Enthusiastic about sneakers 🔥
- Helpful but not pushy
- Use emojis sparingly
- Keep responses concise (2-4 sentences max unless detailed info requested)
- Format product links as markdown: [Product Name](/products/slug)

CURRENT CATALOG:
${productList}

CATEGORIES:
${categoryList}

RULES:
1. ONLY recommend products from the catalog above.
2. When recommending, include the product link, price, and a brief reason why it fits.
3. If asked about products not in the catalog, say you don't carry them currently.
4. You can help with: finding sneakers by style/budget/activity, comparing products, explaining features, checking stock status.
5. For checkout/order/account questions, direct users to the relevant page.
6. Never make up product details — stick to the catalog data.
7. If a coupon is mentioned, suggest they enter it at checkout.`;
}

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'AI assistant is not configured. Please add GEMINI_API_KEY to your environment.' },
      { status: 503 },
    );
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  const body = await request.json();
  const userMessage = (body.message as string)?.trim();
  const history = (body.history as ChatMessage[]) ?? [];

  if (!userMessage) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  try {
    const { products, categories } = await getProductContext(supabase);
    const systemPrompt = buildSystemPrompt(products, categories);

    const contents = [
      ...history.map((msg) => ({
        role: msg.role,
        parts: msg.parts,
      })),
      { role: 'user', parts: [{ text: userMessage }] },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 512,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return NextResponse.json(
        { error: 'AI service temporarily unavailable.' },
        { status: 502 },
      );
    }

    const data = await response.json();
    const aiText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "I'm sorry, I couldn't generate a response. Please try again!";

    return NextResponse.json({
      response: aiText,
      role: 'model',
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
