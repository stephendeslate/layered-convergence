import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock('@/app/actions', () => ({
  registerAction: jest.fn(),
}));

jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    useActionState: jest.fn(() => [{}, jest.fn(), false]),
  };
});

import RegisterPage from '@/app/(auth)/register/page';

describe('RegisterPage', () => {
  it('renders all required fields', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
  });

  it('renders create account button', () => {
    render(<RegisterPage />);
    expect(
      screen.getByRole('button', { name: 'Create Account' }),
    ).toBeInTheDocument();
  });

  it('has buyer and seller role options', () => {
    render(<RegisterPage />);
    const select = screen.getByLabelText('Role');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Buyer')).toBeInTheDocument();
    expect(screen.getByText('Seller')).toBeInTheDocument();
  });

  it('renders link to login page', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('shows error message when state has error', () => {
    const mockUseActionState = require('react').useActionState;
    mockUseActionState.mockReturnValueOnce([
      { error: 'Email already exists' },
      jest.fn(),
      false,
    ]);

    render(<RegisterPage />);
    expect(screen.getByRole('alert')).toHaveTextContent('Email already exists');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RegisterPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
