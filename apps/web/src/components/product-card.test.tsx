import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/product-card';
import type { CatalogProduct } from '@/lib/catalog/types';

const product: CatalogProduct = {
  id: '20000000-0000-0000-0000-000000000001',
  category_id: '10000000-0000-0000-0000-000000000001',
  name: 'Atlas Court',
  slug: 'atlas-court',
  short_description: 'A court staple.',
  description: 'A detailed court sneaker.',
  price: 110,
  compare_at_price: 135,
  image_url: 'https://placehold.co/1200x1200/png?text=Atlas+Court',
  model_3d_url: null,
  stock: 0,
  is_featured: true,
  is_active: true,
  created_at: '2026-07-14T00:00:00.000Z',
  updated_at: '2026-07-14T00:00:00.000Z',
  category: {
    id: '10000000-0000-0000-0000-000000000001',
    name: 'Court',
    slug: 'court',
    description: null,
    image_url: null,
  },
  images: [
    {
      id: '30000000-0000-0000-0000-000000000001',
      image_url: 'https://placehold.co/1200x1200/png?text=Atlas+Court',
      alt_text: 'Atlas Court sneaker in a studio setting',
      sort_order: 0,
    },
  ],
  variants: [
    {
      id: '40000000-0000-0000-0000-000000000001',
      color_name: 'Cloud',
      color_hex: '#E8E6E0',
      size: '8',
      stock: 3,
      sku: 'ATLAS-CLOUD-8',
    },
  ],
};

describe('ProductCard', () => {
  it('renders comparison price, stock status, accessible image, and detail link', () => {
    render(<ProductCard isAuthenticated product={product} returnPath="/products" />);

    expect(
      screen.getByRole('img', { name: /atlas court sneaker in a studio setting/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Atlas Court' })).toHaveAttribute(
      'href',
      '/products/atlas-court',
    );
    expect(screen.getByText('$110.00')).toBeInTheDocument();
    expect(screen.getByText('$135.00')).toHaveClass('line-through');
    expect(screen.getByText('Only 3 left')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /save atlas court to favorites/i }),
    ).toBeInTheDocument();
  });
});
