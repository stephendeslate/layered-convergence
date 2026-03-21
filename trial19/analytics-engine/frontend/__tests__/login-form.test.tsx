import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';

const mockUseActionState = vi.fn(() => [{ error: null, success: false }, vi.fn(), false]);

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useActionState: (...args: unknown[]) => mockUseActionState(...args),
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/app/actions', () => ({
  loginAction: vi.fn(),
}));

import LoginPage from '@/app/login/page';

describe('LoginPage', () => {
  beforeEach(() => {
    mockUseActionState.mockReturnValue([{ error: null, success: false }, vi.fn(), false]);
  });

  it('renders login form with required fields', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('displays error when present', () => {
    mockUseActionState.mockReturnValue([{ error: 'Invalid credentials', success: false }, vi.fn(), false]);

    render(<LoginPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
  });

  it('has accessible form label', () => {
    render(<LoginPage />);
    expect(screen.getByRole('form', { name: /login form/i })).toBeInTheDocument();
  });

  it('passes accessibility checks', async () => {
    const { container } = render(<LoginPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
