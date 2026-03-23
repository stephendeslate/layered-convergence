/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// TRACED:AE-TEST-010
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn() }),
}));

describe('Keyboard Navigation', () => {
  it('should allow tabbing through navigation links', async () => {
    const user = userEvent.setup();
    const { Nav } = await import('@/components/nav');
    render(<Nav />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);

    await user.tab();
    expect(document.activeElement?.tagName).toBe('A');
  });

  it('should allow keyboard submission of login form', async () => {
    const user = userEvent.setup();
    const LoginPage = (await import('@/app/login/page')).default;
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.click(emailInput);
    await user.type(emailInput, 'test@test.com');
    await user.tab();
    expect(document.activeElement).toBe(passwordInput);

    await user.type(passwordInput, 'password123');
    expect(submitButton).not.toBeDisabled();
  });

  it('should have focusable button components', async () => {
    const user = userEvent.setup();
    const { Button } = await import('@/components/ui/button');
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
      </div>,
    );

    await user.tab();
    expect(screen.getByText('First')).toHaveFocus();

    await user.tab();
    expect(screen.getByText('Second')).toHaveFocus();
  });

  it('should have focusable input components', async () => {
    const user = userEvent.setup();
    const { Input } = await import('@/components/ui/input');
    const { Label } = await import('@/components/ui/label');
    render(
      <div>
        <Label htmlFor="test-input">Test</Label>
        <Input id="test-input" placeholder="Type here" />
      </div>,
    );

    await user.tab();
    expect(screen.getByPlaceholderText('Type here')).toHaveFocus();
  });

  it('should disable button when loading', async () => {
    const { Button } = await import('@/components/ui/button');
    render(<Button disabled>Loading...</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
