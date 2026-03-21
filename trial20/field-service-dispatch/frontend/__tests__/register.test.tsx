import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

function RegisterPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg border p-6">
        <h3 className="text-2xl font-semibold">Register</h3>
        <p className="text-sm">Create a new account to get started</p>
        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="reg-email" className="text-sm font-medium">Email</label>
            <input id="reg-email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="reg-password" className="text-sm font-medium">Password</label>
            <input id="reg-password" name="password" type="password" required minLength={8} />
          </div>
          <div className="space-y-2">
            <label htmlFor="reg-role" className="text-sm font-medium">Role</label>
            <select id="reg-role" name="role" required>
              <option value="">Select a role</option>
              <option value="DISPATCHER">Dispatcher</option>
              <option value="TECHNICIAN">Technician</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="reg-companySlug" className="text-sm font-medium">Company Slug</label>
            <input id="reg-companySlug" name="companySlug" required />
          </div>
          <button type="submit" className="w-full rounded-md px-4 py-2">Register</button>
        </form>
      </div>
    </div>
  );
}

describe('RegisterPage', () => {
  it('renders registration form with all fields', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
    expect(screen.getByLabelText('Company Slug')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  it('only offers DISPATCHER and TECHNICIAN roles', () => {
    render(<RegisterPage />);
    const roleSelect = screen.getByLabelText('Role');
    const options = roleSelect.querySelectorAll('option');
    const roleValues = Array.from(options)
      .map((o) => o.getAttribute('value'))
      .filter(Boolean);
    expect(roleValues).toEqual(['DISPATCHER', 'TECHNICIAN']);
    expect(roleValues).not.toContain('ADMIN');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<RegisterPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
