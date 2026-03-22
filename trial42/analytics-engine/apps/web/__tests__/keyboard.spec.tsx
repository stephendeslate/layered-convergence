/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// TRACED:AE-TEST-010
describe('Keyboard Navigation', () => {
  it('should focus Button on Tab', async () => {
    const user = userEvent.setup();
    render(<Button>Click me</Button>);

    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('should activate Button on Enter', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should activate Button on Space', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should focus Input on Tab', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter text" />);

    await user.tab();
    expect(screen.getByPlaceholderText('Enter text')).toHaveFocus();
  });

  it('should allow typing in Input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter text" />);

    await user.tab();
    await user.type(screen.getByPlaceholderText('Enter text'), 'Hello');
    expect(screen.getByPlaceholderText('Enter text')).toHaveValue('Hello');
  });

  it('should navigate between multiple buttons', async () => {
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

  it('should not focus disabled Button', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>Enabled</Button>
        <Button disabled>Disabled</Button>
      </div>,
    );

    await user.tab();
    expect(screen.getByText('Enabled')).toHaveFocus();

    await user.tab();
    expect(screen.getByText('Disabled')).not.toHaveFocus();
  });
});
