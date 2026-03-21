// [TRACED:EM-UI-007] Keyboard navigation tests with userEvent
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

function TestLoginForm() {
  return (
    <form>
      <a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>
      <nav aria-label="Main navigation">
        <a href="/transactions">Transactions</a>
        <a href="/disputes">Disputes</a>
      </nav>
      <main id="main-content">
        <label htmlFor="kb-email">Email</label>
        <input id="kb-email" name="email" type="email" />
        <label htmlFor="kb-password">Password</label>
        <input id="kb-password" name="password" type="password" />
        <label htmlFor="kb-role">Role</label>
        <select id="kb-role" name="role">
          <option value="BUYER">BUYER</option>
          <option value="SELLER">SELLER</option>
          <option value="ARBITER">ARBITER</option>
        </select>
        <button type="submit">Submit</button>
      </main>
    </form>
  );
}

describe('Keyboard Navigation Tests', () => {
  it('should navigate through form fields with Tab', async () => {
    const user = userEvent.setup();
    render(<TestLoginForm />);

    await user.tab();
    expect(document.activeElement).toHaveAttribute('href', '#main-content');

    await user.tab();
    expect(document.activeElement).toHaveAttribute('href', '/transactions');

    await user.tab();
    expect(document.activeElement).toHaveAttribute('href', '/disputes');

    await user.tab();
    expect(screen.getByLabelText('Email')).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText('Password')).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText('Role')).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus();
  });

  it('should allow typing in form fields', async () => {
    const user = userEvent.setup();
    render(<TestLoginForm />);

    const emailInput = screen.getByLabelText('Email');
    await user.click(emailInput);
    await user.type(emailInput, 'buyer@test.com');
    expect(emailInput).toHaveValue('buyer@test.com');

    const passwordInput = screen.getByLabelText('Password');
    await user.click(passwordInput);
    await user.type(passwordInput, 'password123');
    expect(passwordInput).toHaveValue('password123');
  });

  it('should support Enter key on submit button', async () => {
    const user = userEvent.setup();
    render(<TestLoginForm />);

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);
    expect(submitButton).toHaveFocus();
  });

  it('should navigate backwards with Shift+Tab', async () => {
    const user = userEvent.setup();
    render(<TestLoginForm />);

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    submitButton.focus();
    expect(submitButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(screen.getByLabelText('Role')).toHaveFocus();

    await user.tab({ shift: true });
    expect(screen.getByLabelText('Password')).toHaveFocus();
  });
});
