import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ProductForm } from '@/components/admin/product-form';

const { push, refresh, saveProductAction } = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  saveProductAction: vi.fn(),
}));

vi.mock('@/app/actions/admin', () => ({ saveProductAction }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }));

describe('ProductForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    saveProductAction.mockResolvedValue({ success: 'Product created.' });
  });

  it('lets an admin add and remove a variant row before save', () => {
    render(<ProductForm categories={[]} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add variant' }));
    expect(screen.getByRole('button', { name: 'Remove variant 1' })).toBeInTheDocument();
    expect(screen.getByText('Variant 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remove variant 1' }));
    expect(screen.queryByText('Variant 1')).not.toBeInTheDocument();
    expect(screen.getByText('No variants yet. Default stock will be used.')).toBeInTheDocument();
  });

  it('renders a safe server validation summary', async () => {
    const user = userEvent.setup();
    saveProductAction.mockResolvedValue({ error: 'Price cannot be negative.' });
    render(<ProductForm categories={[]} />);

    await user.type(screen.getByLabelText(/Product name/), 'Velocity Court');
    await user.click(screen.getByRole('button', { name: 'Create product' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Price cannot be negative.');
  });
});
