// TRACED:AE-TEST-07 — Keyboard navigation tests with userEvent
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

describe('Keyboard Navigation', () => {
  it('should focus button with Tab key', async () => {
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

  it('should activate button with Enter key', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await user.tab();
    await user.keyboard('{Enter}');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should activate button with Space key', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Press me</Button>);

    await user.tab();
    await user.keyboard(' ');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should focus input with Tab key', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Input placeholder="First input" />
        <Input placeholder="Second input" />
      </div>,
    );

    await user.tab();
    expect(screen.getByPlaceholderText('First input')).toHaveFocus();

    await user.tab();
    expect(screen.getByPlaceholderText('Second input')).toHaveFocus();
  });

  it('should type in input when focused', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);

    await user.tab();
    await user.type(screen.getByPlaceholderText('Type here'), 'hello');

    expect(screen.getByPlaceholderText('Type here')).toHaveValue('hello');
  });

  it('should navigate backwards with Shift+Tab', async () => {
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
