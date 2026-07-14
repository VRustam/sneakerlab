import { render, screen } from '@testing-library/react';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';

describe('feedback states', () => {
  it('renders loading, empty, and error states accessibly', () => {
    render(
      <>
        <LoadingState title="Loading products" />
        <EmptyState title="No products" />
        <ErrorState title="Catalog unavailable" />
      </>,
    );

    expect(screen.getByText('Loading products')).toBeInTheDocument();
    expect(screen.getByText('No products')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Catalog unavailable');
  });
});
