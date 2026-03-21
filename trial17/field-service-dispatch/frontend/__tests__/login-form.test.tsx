import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { LoginForm } from '@/app/(auth)/login/login-form';

expect.extend(toHaveNoViolations);

vi.mock('@/app/actions', () => ({
  loginAction: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useActionState: vi.fn((fn: any, init: any) => [init, vi.fn(), false]),
  };
});

describe('LoginForm', () => {
  it('renders email input', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders password input', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders company ID input', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Company ID')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('renders register link', () => {
    render(<LoginForm />);
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<LoginForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
