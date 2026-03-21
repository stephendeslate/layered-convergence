import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

describe('Keyboard Navigation Tests', () => {
  it('should allow tabbing through form elements', async () => {
    const { getByLabelText, getByRole } = render(
      <form>
        <label htmlFor="test-email">Email</label>
        <Input id="test-email" type="email" />
        <label htmlFor="test-pass">Password</label>
        <Input id="test-pass" type="password" />
        <Button type="submit">Submit</Button>
      </form>,
    );

    const emailInput = getByLabelText('Email');
    const passInput = getByLabelText('Password');
    const submitButton = getByRole('button', { name: 'Submit' });

    await userEvent.tab();
    expect(document.activeElement).toBe(emailInput);

    await userEvent.tab();
    expect(document.activeElement).toBe(passInput);

    await userEvent.tab();
    expect(document.activeElement).toBe(submitButton);
  });

  it('button should be activatable with Enter key', async () => {
    let clicked = false;
    const { getByRole } = render(
      <Button onClick={() => { clicked = true; }}>Click Me</Button>,
    );

    const button = getByRole('button');
    button.focus();
    await userEvent.keyboard('{Enter}');
    expect(clicked).toBe(true);
  });

  it('button should be activatable with Space key', async () => {
    let clicked = false;
    const { getByRole } = render(
      <Button onClick={() => { clicked = true; }}>Press Me</Button>,
    );

    const button = getByRole('button');
    button.focus();
    await userEvent.keyboard(' ');
    expect(clicked).toBe(true);
  });

  it('should have visible focus indicator', () => {
    const { getByRole } = render(<Button>Focus Test</Button>);
    const button = getByRole('button');

    // The button should have focus-visible styles defined
    expect(button.className).toContain('focus-visible');
  });
});
