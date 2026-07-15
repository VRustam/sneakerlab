import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AdminConfirmForm } from '@/components/admin/admin-confirm-form';

beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value() {
      this.setAttribute('open', '');
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value() {
      this.removeAttribute('open');
    },
  });
});

describe('AdminConfirmForm', () => {
  it('requires explicit confirmation before calling a destructive action', async () => {
    const user = userEvent.setup();
    const action = vi.fn().mockResolvedValue({ success: 'Removed.' });
    render(
      <AdminConfirmForm
        action={action}
        confirmLabel="Deactivate"
        description="This hides the product."
        fields={{ id: '20000000-0000-0000-0000-000000000001', isActive: 'false' }}
        title="Deactivate product?"
        triggerLabel="Deactivate"
        destructive
      />,
    );

    await user.click(screen.getAllByRole('button', { name: 'Deactivate' })[0]!);
    expect(action).not.toHaveBeenCalled();
    expect(screen.getByText('This hides the product.')).toBeInTheDocument();

    const dialog = screen.getByText('This hides the product.').closest('dialog');
    expect(dialog).not.toBeNull();
    await user.click(within(dialog!).getByRole('button', { name: 'Deactivate' }));
    expect(action).toHaveBeenCalledTimes(1);
    const submitted = action.mock.calls[0]?.[0] as FormData;
    expect(submitted.get('isActive')).toBe('false');
  });
});
