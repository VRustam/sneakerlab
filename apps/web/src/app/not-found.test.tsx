import { render, screen } from '@testing-library/react';
import NotFound from '@/app/not-found';

describe('NotFound', () => {
  it('offers a useful return path', () => {
    render(<NotFound />);
    expect(screen.getByRole('heading', { name: 'This page stepped out.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
  });
});
