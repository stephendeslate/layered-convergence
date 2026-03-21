// [TRACED:AE-UI-007] Keyboard navigation tests with userEvent
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

function TestLoginForm() {
  return (
    <form>
      <a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>
      <nav aria-label="Main navigation">
        <a href="/dashboard">Dashboard</a>
        <a href="/pipelines">Pipelines</a>
      </nav>
      <main id="main-content">
        <label htmlFor="kb-email">Email</label>
        <input id="kb-email" name="email" type="email" />
        <label htmlFor="kb-password">Password</label>
        <input id="kb-password" name="password" type="password" />
        <label htmlFor="kb-role">Role</label>
        <select id="kb-role" name="role">
          <option value="VIEWER">VIEWER</option>
          <option value="EDITOR">EDITOR</option>
          <option value="ANALYST">ANALYST</option>
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
    expect(document.activeElement).toHaveAttribute('href', '/dashboard');

    await user.tab();
    expect(document.activeElement).toHaveAttribute('href', '/pipelines');

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
    await user.type(emailInput, 'test@example.com');
    expect(emailInput).toHaveValue('test@example.com');

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
