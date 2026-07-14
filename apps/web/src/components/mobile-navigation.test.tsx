import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileNavigation } from '@/components/mobile-navigation';

describe('MobileNavigation', () => {
  it('opens and closes the mobile navigation', async () => {
    const user = userEvent.setup();
    render(<MobileNavigation />);

    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close navigation' }));
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).not.toBeInTheDocument();
  });
});
