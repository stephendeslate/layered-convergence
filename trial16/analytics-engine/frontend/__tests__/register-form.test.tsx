import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import RegisterPage from '@/app/(auth)/register/page';

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
  registerAction: vi.fn(),
}));

describe('RegisterPage', () => {
  it('should render registration form with all fields', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/organization id/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should have required attributes on all inputs', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/full name/i)).toBeRequired();
    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/password/i)).toBeRequired();
    expect(screen.getByLabelText(/organization id/i)).toBeRequired();
  });

  it('should allow typing in all fields', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/password/i), 'securePass123');
    await user.type(screen.getByLabelText(/organization id/i), 'org-123');
    expect(screen.getByLabelText(/full name/i)).toHaveValue('John Doe');
    expect(screen.getByLabelText(/email/i)).toHaveValue('john@example.com');
    expect(screen.getByLabelText(/password/i)).toHaveValue('securePass123');
    expect(screen.getByLabelText(/organization id/i)).toHaveValue('org-123');
  });

  it('should have a link to login page', () => {
    render(<RegisterPage />);
    const loginLink = screen.getByRole('link', { name: /sign in/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should have correct input types', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText(/full name/i)).toHaveAttribute('type', 'text');
  });

  it('should have autocomplete attributes', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByLabelText(/full name/i)).toHaveAttribute('autocomplete', 'name');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<RegisterPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
