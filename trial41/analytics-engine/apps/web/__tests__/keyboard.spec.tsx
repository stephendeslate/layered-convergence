// TRACED:AE-KEYBOARD-TEST
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

describe('Keyboard Navigation', () => {
  it('should focus button on tab', async () => {
    const user = userEvent.setup();
    render(<Button>Submit</Button>);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus();
  });

  it('should trigger button click on Enter', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should trigger button click on Space', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should focus input on tab', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter text" />);

    await user.tab();
    expect(screen.getByPlaceholderText('Enter text')).toHaveFocus();
  });

  it('should allow typing in focused input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter text" />);

    await user.tab();
    await user.type(screen.getByPlaceholderText('Enter text'), 'Hello');
    expect(screen.getByPlaceholderText('Enter text')).toHaveValue('Hello');
  });

  it('should tab through multiple interactive elements', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>First</Button>
        <Input placeholder="Middle" />
        <Button>Last</Button>
      </div>,
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();

    await user.tab();
    expect(screen.getByPlaceholderText('Middle')).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
  });

  it('should not activate disabled buttons', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(handleClick).not.toHaveBeenCalled();
  });
});
