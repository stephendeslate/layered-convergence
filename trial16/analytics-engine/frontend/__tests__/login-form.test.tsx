import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import LoginPage from '@/app/(auth)/login/page';

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useActionState: (fn: Function, initialState: unknown) => {
      return [initialState, vi.fn(), false];
    },
  };
});

vi.mock('@/app/actions', () => ({
  loginAction: vi.fn(),
}));

describe('LoginPage', () => {
  it('should render login form with email and password fields', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should have required attributes on inputs', () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should allow typing in form fields', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('should have a link to register page', () => {
    render(<LoginPage />);
    const registerLink = screen.getByRole('link', { name: /register/i });
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('should have autocomplete attributes for accessibility', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('autocomplete', 'current-password');
  });

  it('should have minimum length on password field', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('minLength', '8');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<LoginPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
