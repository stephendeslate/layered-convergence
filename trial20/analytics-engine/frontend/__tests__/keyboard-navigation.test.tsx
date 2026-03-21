import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

describe('Keyboard Navigation', () => {
  it('should tab through form elements in order', async () => {
    const user = userEvent.setup();

    render(
      <form>
        <div>
          <Label htmlFor="field-1">Field 1</Label>
          <Input id="field-1" name="field1" />
        </div>
        <div>
          <Label htmlFor="field-2">Field 2</Label>
          <Input id="field-2" name="field2" />
        </div>
        <Button type="submit">Submit</Button>
      </form>,
    );

    await user.tab();
    expect(screen.getByLabelText('Field 1')).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText('Field 2')).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus();
  });

  it('should activate button with Enter key', async () => {
    const user = userEvent.setup();
    let clicked = false;

    render(
      <Button onClick={() => { clicked = true; }}>Press Enter</Button>,
    );

    const button = screen.getByRole('button', { name: 'Press Enter' });
    button.focus();
    await user.keyboard('{Enter}');
    expect(clicked).toBe(true);
  });

  it('should activate button with Space key', async () => {
    const user = userEvent.setup();
    let clicked = false;

    render(
      <Button onClick={() => { clicked = true; }}>Press Space</Button>,
    );

    const button = screen.getByRole('button', { name: 'Press Space' });
    button.focus();
    await user.keyboard(' ');
    expect(clicked).toBe(true);
  });

  it('should skip disabled elements during tab navigation', async () => {
    const user = userEvent.setup();

    render(
      <form>
        <Label htmlFor="enabled-1">Enabled 1</Label>
        <Input id="enabled-1" />
        <Input disabled aria-label="Disabled" />
        <Label htmlFor="enabled-2">Enabled 2</Label>
        <Input id="enabled-2" />
      </form>,
    );

    await user.tab();
    expect(screen.getByLabelText('Enabled 1')).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText('Enabled 2')).toHaveFocus();
  });

  it('keyboard-navigable form should have no accessibility violations', async () => {
    const { container } = render(
      <form aria-label="Test form">
        <Label htmlFor="kb-test">Input</Label>
        <Input id="kb-test" />
        <Button type="submit">Submit</Button>
      </form>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
