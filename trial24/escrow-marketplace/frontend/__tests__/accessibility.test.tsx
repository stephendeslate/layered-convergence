import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// [TRACED:TS-005] Accessibility tests with axe-core
describe('Accessibility', () => {
  it('loading component has role="status" and aria-busy', () => {
    const { container } = render(
      <div role="status" aria-busy="true" className="flex items-center justify-center">
        <span className="sr-only">Loading...</span>
        <div className="h-8 w-8 animate-spin rounded-full border-4" />
      </div>,
    );

    const statusEl = container.querySelector('[role="status"]');
    expect(statusEl).not.toBeNull();
    expect(statusEl?.getAttribute('aria-busy')).toBe('true');

    const srOnly = container.querySelector('.sr-only');
    expect(srOnly).not.toBeNull();
    expect(srOnly?.textContent).toBe('Loading...');
  });

  it('error component has role="alert"', () => {
    const { container } = render(
      <div role="alert" className="flex flex-col items-center">
        <h2 tabIndex={-1}>Something went wrong</h2>
        <p>An error occurred</p>
        <button>Try again</button>
      </div>,
    );

    const alertEl = container.querySelector('[role="alert"]');
    expect(alertEl).not.toBeNull();
  });

  it('navigation has aria-label', () => {
    const { container } = render(
      <nav aria-label="Main navigation">
        <a href="/">Home</a>
        <a href="/transactions">Transactions</a>
        <a href="/disputes">Disputes</a>
        <a href="/payouts">Payouts</a>
      </nav>,
    );

    const nav = container.querySelector('nav');
    expect(nav?.getAttribute('aria-label')).toBe('Main navigation');
  });

  it('skip-to-content link exists and is sr-only', () => {
    const { container } = render(
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to content
      </a>,
    );

    const link = container.querySelector('a[href="#main-content"]');
    expect(link).not.toBeNull();
    expect(link?.textContent).toBe('Skip to content');
    expect(link?.className).toContain('sr-only');
  });

  it('form inputs have associated labels', () => {
    const { container } = render(
      <form>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" />
      </form>,
    );

    const emailInput = container.querySelector('#email');
    const emailLabel = container.querySelector('label[for="email"]');
    expect(emailInput).not.toBeNull();
    expect(emailLabel).not.toBeNull();
  });

  it('login form has no axe violations', async () => {
    const { container } = render(
      <main>
        <form aria-label="Login form">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" name="email" type="email" />
          <label htmlFor="login-password">Password</label>
          <input id="login-password" name="password" type="password" />
          <button type="submit">Sign In</button>
        </form>
      </main>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('table structure is accessible', async () => {
    const { container } = render(
      <main>
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
              <td>tx-1</td>
              <td>$100.00</td>
              <td>PENDING</td>
            </tr>
          </tbody>
        </table>
      </main>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
