import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useRouter: jest.fn(() => ({ push: jest.fn(), refresh: jest.fn() })),
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

const mockFormAction = jest.fn();
jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useActionState: jest.fn(() => [null, mockFormAction, false]),
  };
});

import RegisterPage from '../app/register/page';

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const useActionState = jest.requireMock('react').useActionState;
    useActionState.mockReturnValue([null, mockFormAction, false]);
  });

  it('renders registration form with required fields', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RegisterPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('displays error state', () => {
    const useActionState = jest.requireMock('react').useActionState;
    useActionState.mockReturnValue([{ error: 'Email already registered' }, mockFormAction, false]);

    render(<RegisterPage />);
    expect(screen.getByRole('alert')).toHaveTextContent('Email already registered');
  });

  it('supports keyboard navigation through form fields', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.tab();
    expect(screen.getByLabelText(/email/i)).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText(/password/i)).toHaveFocus();
  });

  it('shows link to login page', () => {
    render(<RegisterPage />);
    const loginLink = screen.getByRole('link', { name: /login/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('disables button when pending', () => {
    const useActionState = jest.requireMock('react').useActionState;
    useActionState.mockReturnValue([null, mockFormAction, true]);

    render(<RegisterPage />);
    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
  });
});
