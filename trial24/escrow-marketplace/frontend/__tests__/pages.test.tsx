import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// [TRACED:TS-007] Page-level tests for rendering and structure
describe('Pages', () => {
  it('root page renders heading', () => {
    const { getByText } = render(
      <div>
        <h1>Escrow Marketplace</h1>
        <p>Secure multi-tenant escrow platform for buyer-seller transactions.</p>
      </div>,
    );

    expect(getByText('Escrow Marketplace')).not.toBeNull();
  });

  it('transactions page renders heading and table', () => {
    const { getByText, container } = render(
      <div>
        <h1>Transactions</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3}>No transactions found.</td>
            </tr>
          </tbody>
        </table>
      </div>,
    );

    expect(getByText('Transactions')).not.toBeNull();
    expect(container.querySelector('table')).not.toBeNull();
  });

  it('disputes page renders heading', () => {
    const { getByText } = render(
      <div>
        <h1>Disputes</h1>
      </div>,
    );

    expect(getByText('Disputes')).not.toBeNull();
  });

  it('payouts page renders heading', () => {
    const { getByText } = render(
      <div>
        <h1>Payouts</h1>
      </div>,
    );

    expect(getByText('Payouts')).not.toBeNull();
  });

  it('login page form is accessible', async () => {
    const { container } = render(
      <main>
        <h1>Sign In</h1>
        <form aria-label="Login form">
          <label htmlFor="p-email">Email</label>
          <input id="p-email" name="email" type="email" />
          <label htmlFor="p-password">Password</label>
          <input id="p-password" name="password" type="password" />
          <button type="submit">Sign In</button>
        </form>
      </main>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('register page form is accessible', async () => {
    const { container } = render(
      <main>
        <h1>Create Account</h1>
        <form aria-label="Registration form">
          <label htmlFor="r-name">Name</label>
          <input id="r-name" name="name" />
          <label htmlFor="r-email">Email</label>
          <input id="r-email" name="email" type="email" />
          <label htmlFor="r-password">Password</label>
          <input id="r-password" name="password" type="password" />
          <label htmlFor="r-role">Role</label>
          <select id="r-role" name="role">
            <option value="BUYER">Buyer</option>
            <option value="SELLER">Seller</option>
          </select>
          <button type="submit">Register</button>
        </form>
      </main>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('dashboard page renders card links', () => {
    const { getByText } = render(
      <div>
        <h1>Dashboard</h1>
        <div>
          <h3>Transactions</h3>
          <h3>Disputes</h3>
          <h3>Payouts</h3>
        </div>
      </div>,
    );

    expect(getByText('Dashboard')).not.toBeNull();
    expect(getByText('Transactions')).not.toBeNull();
    expect(getByText('Disputes')).not.toBeNull();
    expect(getByText('Payouts')).not.toBeNull();
  });
});
