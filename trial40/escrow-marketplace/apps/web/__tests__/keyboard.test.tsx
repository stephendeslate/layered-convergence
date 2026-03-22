// TRACED: EM-TEST-010 — Keyboard navigation tests with userEvent
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

  it('Button should be activatable via Enter', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Button should be activatable via Space', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);

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

  it('Disabled button should not be focusable', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>Enabled</Button>
        <Button disabled>Disabled</Button>
        <Button>Also Enabled</Button>
      </div>,
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Enabled' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Also Enabled' })).toHaveFocus();
  });
});
