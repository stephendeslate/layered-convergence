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
  loginAction: vi.fn(),
}));

import LoginPage from '@/app/(auth)/login/page';

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render email and password fields', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should render a sign in button', () => {
    render(<LoginPage />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should allow typing in email and password fields', async () => {
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
    expect(screen.getByText(/register/i)).toBeInTheDocument();
  });

  it('should render card title', () => {
    render(<LoginPage />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('should render card description', () => {
    render(<LoginPage />);
    expect(screen.getByText(/enter your credentials/i)).toBeInTheDocument();
  });

  it('should have required attribute on email field', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeRequired();
  });

  it('should have required attribute on password field', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/password/i)).toBeRequired();
  });

  it('should display error when state has error', async () => {
    const { useActionState } = vi.mocked(await import('react'));
    (useActionState as ReturnType<typeof vi.fn>).mockReturnValue([{ error: 'Invalid credentials' }, mockFormAction, false]);

    render(<LoginPage />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
  });

  it('should show loading text when pending', async () => {
    const { useActionState } = vi.mocked(await import('react'));
    (useActionState as ReturnType<typeof vi.fn>).mockReturnValue([null, mockFormAction, true]);

    render(<LoginPage />);
    expect(screen.getByRole('button')).toHaveTextContent('Signing in...');
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should have no accessibility violations', async () => {
    const { useActionState } = vi.mocked(await import('react'));
    (useActionState as ReturnType<typeof vi.fn>).mockReturnValue([null, mockFormAction, false]);

    const { container } = render(<LoginPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
