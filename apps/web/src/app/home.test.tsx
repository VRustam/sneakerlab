import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

describe('HomePage', () => {
  it('presents the SneakerLab value proposition and primary actions', async () => {
    render(await HomePage());

    expect(
      screen.getByRole('heading', { name: 'Built to move. Made to be seen.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explore products/i })).toHaveAttribute(
      'href',
      '/products',
    );
    expect(screen.getByRole('link', { name: /enter 3d preview/i })).toHaveAttribute(
      'href',
      '/products/pulse-layer',
    );
    expect(screen.getByText('Not just another gallery.')).toBeInTheDocument();
  });
});
