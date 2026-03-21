import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock useActionState
jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useActionState: () => [null, jest.fn(), false],
  };
});

// Mock the action
jest.mock('@/app/actions', () => ({
  registerAction: jest.fn(),
}));

// Mock radix select (not available in jsdom)
jest.mock('@radix-ui/react-select', () => {
  const actual = jest.requireActual('@radix-ui/react-select');
  return {
    ...actual,
    Root: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
    Trigger: ({ children, ...props }: { children: React.ReactNode }) => <button {...props}>{children}</button>,
    Value: ({ placeholder }: { placeholder: string }) => <span>{placeholder}</span>,
    Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Item: ({ children, value, ...props }: { children: React.ReactNode; value: string }) => (
      <option value={value} {...props}>{children}</option>
    ),
    ItemText: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    ItemIndicator: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Viewport: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Icon: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  };
});

import RegisterPage from '@/app/register/page';

describe('RegisterPage', () => {
  it('renders registration form fields', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders register button', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('renders link to login page', () => {
    render(<RegisterPage />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it('passes axe accessibility checks', async () => {
    const { container } = render(<RegisterPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
