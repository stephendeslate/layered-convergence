// TRACED: FD-KEYBOARD-SPEC
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

describe('Keyboard Navigation', () => {
  it('Button should be focusable via keyboard', async () => {
    const user = userEvent.setup();
    render(<Button>Click me</Button>);

    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('Button should be activatable via Enter key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Button should be activatable via Space key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Input should be focusable via keyboard', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Label htmlFor="test">Test</Label>
        <Input id="test" type="text" />
      </div>,
    );

    await user.tab();
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('Input should accept keyboard input', async () => {
    const user = userEvent.setup();
    render(<Input type="text" placeholder="Type here" />);

    const input = screen.getByPlaceholderText('Type here');
    await user.click(input);
    await user.type(input, 'Hello World');
    expect(input).toHaveValue('Hello World');
  });

  it('disabled Button should not be focusable', async () => {
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

  it('multiple buttons should be navigable with Tab', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </div>,
    );

    await user.tab();
    expect(screen.getByText('First')).toHaveFocus();

    await user.tab();
    expect(screen.getByText('Second')).toHaveFocus();

    await user.tab();
    expect(screen.getByText('Third')).toHaveFocus();
  });

  it('Shift+Tab should navigate backwards', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
      </div>,
    );

    await user.tab();
    await user.tab();
    expect(screen.getByText('Second')).toHaveFocus();

    await user.tab({ shift: true });
    expect(screen.getByText('First')).toHaveFocus();
  });
});
