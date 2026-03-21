import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

function TestLayout() {
  return (
    <div>
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <nav aria-label="Main navigation">
        <a href="/dashboard">Dashboard</a>
        <a href="/work-orders">Work Orders</a>
        <a href="/customers">Customers</a>
        <a href="/technicians">Technicians</a>
        <a href="/routes">Routes</a>
        <a href="/invoices">Invoices</a>
      </nav>
      <main id="main-content">
        <h1>Test Page</h1>
        <form>
          <label htmlFor="kb-email">Email</label>
          <input id="kb-email" name="email" type="email" />
          <label htmlFor="kb-password">Password</label>
          <input id="kb-password" name="password" type="password" />
          <button type="submit">Submit</button>
        </form>
      </main>
    </div>
  );
}

describe('Keyboard Navigation', () => {
  it('skip-to-content link is the first focusable element', async () => {
    const user = userEvent.setup();
    render(<TestLayout />);

    await user.tab();
    const skipLink = screen.getByText('Skip to content');
    expect(skipLink).toHaveFocus();
  });

  it('tab navigates through nav links in order', async () => {
    const user = userEvent.setup();
    render(<TestLayout />);

    // Skip link
    await user.tab();
    expect(screen.getByText('Skip to content')).toHaveFocus();

    // Nav links
    await user.tab();
    expect(screen.getByText('Dashboard')).toHaveFocus();

    await user.tab();
    expect(screen.getByText('Work Orders')).toHaveFocus();

    await user.tab();
    expect(screen.getByText('Customers')).toHaveFocus();

    await user.tab();
    expect(screen.getByText('Technicians')).toHaveFocus();

    await user.tab();
    expect(screen.getByText('Routes')).toHaveFocus();

    await user.tab();
    expect(screen.getByText('Invoices')).toHaveFocus();
  });

  it('tab continues from nav to form fields', async () => {
    const user = userEvent.setup();
    render(<TestLayout />);

    // Tab through skip link + 6 nav links
    for (let i = 0; i < 7; i++) {
      await user.tab();
    }

    // Now should be on email input
    await user.tab();
    expect(screen.getByLabelText('Email')).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText('Password')).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus();
  });

  it('shift+tab navigates backwards', async () => {
    const user = userEvent.setup();
    render(<TestLayout />);

    // Focus the submit button directly
    screen.getByRole('button', { name: 'Submit' }).focus();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus();

    await user.tab({ shift: true });
    expect(screen.getByLabelText('Password')).toHaveFocus();

    await user.tab({ shift: true });
    expect(screen.getByLabelText('Email')).toHaveFocus();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<TestLayout />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
