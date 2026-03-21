import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

// Mock the server action
jest.mock('@/app/actions', () => ({
  loginAction: jest.fn(),
}));

// Mock useActionState
jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    useActionState: jest.fn(() => [{}, jest.fn(), false]),
  };
});

// Import after mocks
import LoginPage from '@/app/(auth)/login/page';

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    render(<LoginPage />);
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('renders link to register page', () => {
    render(<LoginPage />);
    expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute(
      'href',
      '/register',
    );
  });

  it('email input has correct type', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
  });

  it('password input has correct type', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('shows error message when state has error', () => {
    const mockUseActionState = require('react').useActionState;
    mockUseActionState.mockReturnValueOnce([
      { error: 'Invalid credentials' },
      jest.fn(),
      false,
    ]);

    render(<LoginPage />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<LoginPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
