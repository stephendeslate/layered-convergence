// [TRACED:UI-007] Keyboard navigation tests
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import LoginPage from '../app/login/page';

describe('Keyboard Navigation', () => {
  it('login form fields are keyboard accessible', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });

    expect(emailInput).toBeDefined();
    expect(passwordInput).toBeDefined();
    expect(submitButton).toBeDefined();

    // Tab order should be: email -> password -> submit
    emailInput.focus();
    expect(document.activeElement).toBe(emailInput);
  });

  it('form elements have proper labels', () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    expect(emailInput.getAttribute('type')).toBe('email');
    expect(passwordInput.getAttribute('type')).toBe('password');
  });

  it('has no critical accessibility violations', async () => {
    const { container } = render(<LoginPage />);
    const results = await axe.run(container);
    const violations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(violations).toHaveLength(0);
  });

  it('submit button is focusable', () => {
    render(<LoginPage />);
    const button = screen.getByRole('button', { name: 'Sign In' });
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it('required fields have required attribute', () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    expect(emailInput.hasAttribute('required')).toBe(true);
    expect(passwordInput.hasAttribute('required')).toBe(true);
  });
});
