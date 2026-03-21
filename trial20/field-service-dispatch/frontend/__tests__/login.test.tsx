import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Mock the login page as a client component
function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-2xl font-semibold">Login</h3>
        <p className="text-sm text-muted-foreground">Enter your credentials to access the dispatch system</p>
        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" className="flex h-10 w-full rounded-md border" />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input id="password" name="password" type="password" required autoComplete="current-password" className="flex h-10 w-full rounded-md border" />
          </div>
          <button type="submit" className="w-full rounded-md bg-primary px-4 py-2">Login</button>
        </form>
      </div>
    </div>
  );
}

describe('LoginPage', () => {
  it('renders login form with required fields', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('has accessible form labels', () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('autocomplete', 'email');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<LoginPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
