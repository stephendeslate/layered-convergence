// TRACED: FD-TEST-UI-002 — Keyboard interaction tests with userEvent
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

describe('Keyboard Interactions', () => {
  it('Button is focusable via Tab', async () => {
    const user = userEvent.setup();
    render(<Button>Submit</Button>);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus();
  });

  it('Button fires onClick on Enter key', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('Button fires onClick on Space key', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    await user.tab();
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled Button cannot be focused via Tab', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>First</Button>
        <Button disabled>Disabled</Button>
        <Button>Last</Button>
      </div>,
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
  });

  it('Input accepts keyboard input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);
    const input = screen.getByPlaceholderText('Type here');
    await user.click(input);
    await user.type(input, 'hello world');
    expect(input).toHaveValue('hello world');
  });

  it('Input clears on select-all and delete', async () => {
    const user = userEvent.setup();
    render(<Input defaultValue="existing text" />);
    const input = screen.getByDisplayValue('existing text');
    await user.tripleClick(input);
    await user.keyboard('{Backspace}');
    expect(input).toHaveValue('');
  });

  it('Label click focuses associated input', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Label htmlFor="email-input">Email</Label>
        <Input id="email-input" type="email" />
      </div>,
    );
    await user.click(screen.getByText('Email'));
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('Tab order follows DOM order', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Input placeholder="First" />
        <Input placeholder="Second" />
        <Button>Submit</Button>
      </div>,
    );
    await user.tab();
    expect(screen.getByPlaceholderText('First')).toHaveFocus();
    await user.tab();
    expect(screen.getByPlaceholderText('Second')).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus();
  });
});
