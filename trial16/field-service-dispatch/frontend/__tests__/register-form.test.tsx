import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

const mockFormAction = vi.fn();

vi.mock('react', async () => {
  const actualReact = await vi.importActual<typeof import('react')>('react');
  return {
    ...actualReact,
    useActionState: vi.fn(() => [null, mockFormAction, false]),
  };
});

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/app/actions/auth', () => ({
  registerAction: vi.fn(),
}));

import RegisterPage from '@/app/(auth)/register/page';

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all registration fields', () => {
    render(<RegisterPage />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
  });

  it('should render create account button', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should allow typing in all fields', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const companyInput = screen.getByLabelText(/company name/i);

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(companyInput, 'Acme Corp');

    expect(nameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');
    expect(passwordInput).toHaveValue('password123');
    expect(companyInput).toHaveValue('Acme Corp');
  });

  it('should have a link to login page', () => {
    render(<RegisterPage />);
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it('should render card title', () => {
    render(<RegisterPage />);
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('should have required attribute on name field', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/full name/i)).toBeRequired();
  });

  it('should have required attribute on email field', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/email/i)).toBeRequired();
  });

  it('should have required attribute on password field', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/password/i)).toBeRequired();
  });

  it('should have minLength on password field', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('minLength', '8');
  });

  it('should display error when state has error', async () => {
    const { useActionState } = vi.mocked(await import('react'));
    (useActionState as ReturnType<typeof vi.fn>).mockReturnValue([{ error: 'Email already exists' }, mockFormAction, false]);

    render(<RegisterPage />);
    expect(screen.getByRole('alert')).toHaveTextContent('Email already exists');
  });

  it('should show loading text when pending', async () => {
    const { useActionState } = vi.mocked(await import('react'));
    (useActionState as ReturnType<typeof vi.fn>).mockReturnValue([null, mockFormAction, true]);

    render(<RegisterPage />);
    expect(screen.getByRole('button')).toHaveTextContent('Creating account...');
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should have no accessibility violations', async () => {
    const { useActionState } = vi.mocked(await import('react'));
    (useActionState as ReturnType<typeof vi.fn>).mockReturnValue([null, mockFormAction, false]);

    const { container } = render(<RegisterPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
