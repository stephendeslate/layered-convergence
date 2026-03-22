// TRACED: FD-TEST-008 — Keyboard navigation tests
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

describe('Keyboard Navigation', () => {
  it('Button should be focusable via Tab', async () => {
    const user = userEvent.setup();
    render(<Button>Click me</Button>);

    await user.tab();

    expect(screen.getByRole('button', { name: 'Click me' })).toHaveFocus();
  });

  it('Button should respond to Enter', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Submit</Button>);

    await user.tab();
    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Button should respond to Space', async () => {
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

  it('Multiple buttons should be navigable via Tab', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
      </div>
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();
  });

  it('Disabled button should not be focusable', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button disabled>Disabled</Button>
        <Button>Enabled</Button>
      </div>
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Enabled' })).toHaveFocus();
  });
});
