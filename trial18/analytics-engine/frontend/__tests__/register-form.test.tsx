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
  registerAction: vi.fn(),
}));

import RegisterPage from '@/app/(auth)/register/page';

describe('RegisterPage', () => {
  beforeEach(() => {
    mockUseActionState.mockReturnValue([{ error: null, success: false }, vi.fn(), false]);
  });

  it('renders registration form with all fields', () => {
    render(<RegisterPage />);

    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Tenant ID')).toBeInTheDocument();
    expect(screen.getByLabelText('User role')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('only shows non-admin roles in dropdown', () => {
    render(<RegisterPage />);

    const roleSelect = screen.getByLabelText('User role');
    const options = roleSelect.querySelectorAll('option');
    const values = Array.from(options).map((o) => o.getAttribute('value'));

    expect(values).toContain('VIEWER');
    expect(values).toContain('EDITOR');
    expect(values).toContain('ANALYST');
    expect(values).not.toContain('ADMIN');
  });

  it('displays error when present', () => {
    mockUseActionState.mockReturnValue([{ error: 'Registration failed', success: false }, vi.fn(), false]);

    render(<RegisterPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('Registration failed');
  });

  it('passes accessibility checks', async () => {
    const { container } = render(<RegisterPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
