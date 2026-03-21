import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

expect.extend(toHaveNoViolations);

describe('Keyboard Navigation', () => {
  it('should allow tab navigation between form elements', async () => {
    const user = userEvent.setup();
    render(
      <form>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" />
        </div>
        <Button type="submit">Submit</Button>
      </form>,
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Submit' });

    await user.tab();
    expect(emailInput).toHaveFocus();

    await user.tab();
    expect(passwordInput).toHaveFocus();

    await user.tab();
    expect(submitButton).toHaveFocus();
  });

  it('should activate button with Enter key', async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(
      <Button onClick={() => { clicked = true; }}>Click Me</Button>,
    );

    const button = screen.getByRole('button', { name: 'Click Me' });
    button.focus();
    await user.keyboard('{Enter}');
    expect(clicked).toBe(true);
  });

  it('should activate button with Space key', async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(
      <Button onClick={() => { clicked = true; }}>Press Me</Button>,
    );

    const button = screen.getByRole('button', { name: 'Press Me' });
    button.focus();
    await user.keyboard(' ');
    expect(clicked).toBe(true);
  });

  it('should have no accessibility violations in form', async () => {
    const { container } = render(
      <form aria-label="Test form">
        <div>
          <Label htmlFor="test-input">Test Input</Label>
          <Input id="test-input" name="test" />
        </div>
        <Button type="submit">Submit</Button>
      </form>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
