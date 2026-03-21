import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RegisterForm } from '@/app/(auth)/register/register-form';

expect.extend(toHaveNoViolations);

vi.mock('@/app/actions', () => ({
  registerAction: vi.fn(),
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

describe('RegisterForm', () => {
  it('renders name input', () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
  });

  it('renders email input', () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders password input', () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders company name input', () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText('Company Name')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<RegisterForm />);
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
  });

  it('renders login link', () => {
    render(<RegisterForm />);
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RegisterForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
