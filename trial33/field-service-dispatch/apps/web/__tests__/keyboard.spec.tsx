import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// TRACED: FD-TST-KB-001 — Keyboard navigation tests with userEvent
describe('Keyboard Navigation', () => {
  it('Button should be focusable via Tab', async () => {
    const user = userEvent.setup();
    render(<Button>Click me</Button>);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Click me' })).toHaveFocus();
  });

  it('Button should be activatable via Enter', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Submit</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Button should be activatable via Space', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Submit</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Input should be focusable via Tab', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);

    await user.tab();
    expect(screen.getByPlaceholderText('Type here')).toHaveFocus();
  });

  it('Input should accept keyboard input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);

    await user.tab();
    await user.type(screen.getByPlaceholderText('Type here'), 'hello');
    expect(screen.getByPlaceholderText('Type here')).toHaveValue('hello');
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
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Third' })).toHaveFocus();
  });

  it('disabled button should not be focusable', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button disabled>Disabled</Button>
        <Button>Enabled</Button>
      </div>,
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Enabled' })).toHaveFocus();
  });
});
