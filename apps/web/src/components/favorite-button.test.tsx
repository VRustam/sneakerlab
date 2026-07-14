import { render, screen } from '@testing-library/react';
import { FavoriteButton } from '@/components/favorite-button';

describe('FavoriteButton', () => {
  it('takes anonymous customers to a safe login continuation', () => {
    render(
      <FavoriteButton
        isAuthenticated={false}
        isFavorite={false}
        productId="20000000-0000-0000-0000-000000000001"
        productName="Atlas Court"
        returnPath="/products/atlas-court"
      />,
    );

    expect(screen.getByRole('link', { name: /sign in to save atlas court/i })).toHaveAttribute(
      'href',
      '/login?next=%2Fproducts%2Fatlas-court',
    );
  });

  it('renders a remove label for an existing favorite', () => {
    render(
      <FavoriteButton
        isAuthenticated
        isFavorite
        productId="20000000-0000-0000-0000-000000000001"
        productName="Atlas Court"
        returnPath="/favorites"
      />,
    );

    expect(
      screen.getByRole('button', { name: /remove atlas court from favorites/i }),
    ).toBeInTheDocument();
  });
});
