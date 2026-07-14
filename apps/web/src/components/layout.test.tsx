import { render, screen } from '@testing-library/react';
import { PageContainer } from '@/components/page-container';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

describe('site chrome', () => {
  it('renders desktop navigation and footer links', () => {
    render(
      <>
        <SiteHeader />
        <SiteFooter />
      </>,
    );

    expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Products' })[0]).toHaveAttribute(
      'href',
      '/products',
    );
    expect(screen.getByText(/demo commerce portfolio project/i)).toBeInTheDocument();
  });

  it('renders PageContainer children', () => {
    render(
      <PageContainer>
        <p>Wrapped content</p>
      </PageContainer>,
    );
    expect(screen.getByText('Wrapped content')).toBeInTheDocument();
  });
});
