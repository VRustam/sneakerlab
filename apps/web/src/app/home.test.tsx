import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

describe('HomePage', () => {
  it('presents the SneakerLab value proposition and primary actions', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', { name: 'Explore sneakers from every angle.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explore products/i })).toHaveAttribute(
      'href',
      '/products',
    );
    expect(screen.getByRole('link', { name: /create an account/i })).toHaveAttribute(
      'href',
      '/register',
    );
    expect(screen.getByText('3D-ready details')).toBeInTheDocument();
  });
});
