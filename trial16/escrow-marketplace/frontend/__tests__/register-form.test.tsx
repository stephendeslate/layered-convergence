import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('@/app/actions', () => ({
  register: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

import RegisterPage from '@/app/(auth)/register/page';

describe('RegisterForm', () => {
  it('should render all form fields', () => {
    render(<RegisterPage />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
  });

  it('should have a role select with buyer and seller options', () => {
    render(<RegisterPage />);

    const roleSelect = screen.getByLabelText(/role/i);
    expect(roleSelect).toBeInTheDocument();

    const options = roleSelect.querySelectorAll('option');
    const optionValues = Array.from(options).map((o) => o.value);
    expect(optionValues).toContain('BUYER');
    expect(optionValues).toContain('SELLER');
  });

  it('should allow selecting a role', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const roleSelect = screen.getByLabelText(/role/i);
    await user.selectOptions(roleSelect, 'BUYER');

    expect(roleSelect).toHaveValue('BUYER');
  });

  it('should render create account button', () => {
    render(<RegisterPage />);

    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it('should have a link to login page', () => {
    render(<RegisterPage />);

    const loginLink = screen.getByRole('link', { name: /sign in/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<RegisterPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
