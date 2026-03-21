import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

describe('Keyboard Navigation', () => {
  it('buttons are focusable via tab', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
      </div>,
    );
    await user.tab();
    expect(screen.getByText('First')).toHaveFocus();
    await user.tab();
    expect(screen.getByText('Second')).toHaveFocus();
  });

  it('disabled buttons are not focusable', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button disabled>Disabled</Button>
        <Button>Enabled</Button>
      </div>,
    );
    await user.tab();
    expect(screen.getByText('Enabled')).toHaveFocus();
  });

  it('inputs are focusable via tab', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Input aria-label="first" />
        <Input aria-label="second" />
      </div>,
    );
    await user.tab();
    expect(screen.getByLabelText('first')).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText('second')).toHaveFocus();
  });

  it('focus ring is visible on buttons', () => {
    render(<Button>Focus Ring</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('focus-visible:ring-2');
  });

  it('focus ring is visible on inputs', () => {
    render(<Input aria-label="test" />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('focus-visible:ring-2');
  });

  it('interactive elements pass axe accessibility', async () => {
    const { container } = render(
      <form>
        <label htmlFor="kb-input">Name</label>
        <Input id="kb-input" />
        <Button type="submit">Submit</Button>
      </form>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
