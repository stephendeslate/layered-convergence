// TRACED:KEYBOARD_NAV_TEST — Keyboard navigation test file exists

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

expect.extend(toHaveNoViolations);

describe('Keyboard Navigation', () => {
  it('should allow Tab navigation between form elements', async () => {
    const user = userEvent.setup();

    render(
      <form>
        <div>
          <Label htmlFor="field1">Field 1</Label>
          <Input id="field1" name="field1" />
        </div>
        <div>
          <Label htmlFor="field2">Field 2</Label>
          <Input id="field2" name="field2" />
        </div>
        <Button type="submit">Submit</Button>
      </form>,
    );

    const field1 = screen.getByLabelText('Field 1');
    const field2 = screen.getByLabelText('Field 2');
    const submitBtn = screen.getByText('Submit');

    await user.tab();
    expect(document.activeElement).toBe(field1);

    await user.tab();
    expect(document.activeElement).toBe(field2);

    await user.tab();
    expect(document.activeElement).toBe(submitBtn);
  });

  it('should activate buttons with Enter key', async () => {
    const user = userEvent.setup();
    let clicked = false;

    render(
      <Button onClick={() => { clicked = true; }}>Click Me</Button>,
    );

    const button = screen.getByText('Click Me');
    button.focus();
    await user.keyboard('{Enter}');

    expect(clicked).toBe(true);
  });

  it('should activate buttons with Space key', async () => {
    const user = userEvent.setup();
    let clicked = false;

    render(
      <Button onClick={() => { clicked = true; }}>Press Space</Button>,
    );

    const button = screen.getByText('Press Space');
    button.focus();
    await user.keyboard(' ');

    expect(clicked).toBe(true);
  });

  it('should have visible focus indicators on buttons', () => {
    render(<Button>Focusable</Button>);
    const button = screen.getByText('Focusable');
    expect(button.className).toContain('focus-visible');
  });

  it('should have visible focus indicators on inputs', () => {
    render(
      <div>
        <Label htmlFor="focus-test">Focus Test</Label>
        <Input id="focus-test" />
      </div>,
    );
    const input = screen.getByLabelText('Focus Test');
    expect(input.className).toContain('focus-visible');
  });

  it('form elements should pass accessibility checks', async () => {
    const { container } = render(
      <form>
        <div>
          <Label htmlFor="a11y-field">Accessible Field</Label>
          <Input id="a11y-field" name="a11y-field" />
        </div>
        <Button type="submit">Submit</Button>
      </form>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
