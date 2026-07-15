import { render, screen } from '@testing-library/react';
import { ProductModelViewer } from '@/components/product-model-viewer';

describe('ProductModelViewer', () => {
  it('keeps an accessible image fallback when no model URL is available', () => {
    render(
      <ProductModelViewer
        fallbackImage={{
          src: 'https://placehold.co/1200x1200/png?text=Pulse+Layer',
          alt: 'Pulse Layer sneaker',
        }}
        modelUrl={null}
        productName="Pulse Layer"
      />,
    );

    expect(screen.getByRole('img', { name: 'Pulse Layer sneaker' })).toBeInTheDocument();
    expect(screen.getByText(/3D preview is unavailable/i)).toBeInTheDocument();
    expect(screen.queryByText(/Loading interactive 3D preview/i)).not.toBeInTheDocument();
  });
});
