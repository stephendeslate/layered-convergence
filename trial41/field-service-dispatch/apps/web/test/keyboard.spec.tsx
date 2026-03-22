/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// TRACED: FD-KEYBOARD-TEST
describe('Keyboard Navigation', () => {
  it('should focus button with Tab key', async () => {
    const user = userEvent.setup();
    render(<Button>Submit</Button>);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus();
  });

  it('should trigger button click with Enter key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Submit</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should trigger button click with Space key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Submit</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should allow typing in input fields', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);

    await user.tab();
    await user.keyboard('hello world');
    expect(screen.getByPlaceholderText('Type here')).toHaveValue('hello world');
  });

  it('should navigate between multiple buttons with Tab', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
      </div>,
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();
  });

  it('should not focus disabled buttons', async () => {
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
