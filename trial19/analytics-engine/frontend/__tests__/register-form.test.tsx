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

import RegisterPage from '@/app/register/page';

describe('RegisterPage', () => {
  beforeEach(() => {
    mockUseActionState.mockReturnValue([{ error: null, success: false }, vi.fn(), false]);
  });

  it('renders registration form with required fields', () => {
    render(<RegisterPage />);

    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Tenant ID')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('displays error when present', () => {
    mockUseActionState.mockReturnValue([{ error: 'Registration failed', success: false }, vi.fn(), false]);

    render(<RegisterPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('Registration failed');
  });

  it('uses shadcn Select for role selection (no raw select)', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText('Select role')).toBeInTheDocument();
  });

  it('passes accessibility checks', async () => {
    const { container } = render(<RegisterPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
