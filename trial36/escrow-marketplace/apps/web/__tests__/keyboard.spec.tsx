/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';

// TRACED: EM-TEST-005 — Keyboard navigation tests

describe('Keyboard Navigation', () => {
  it('should Tab through interactive elements', async () => {
    const user = userEvent.setup();

    render(
      <form>
        <label htmlFor="name-input">Name</label>
        <Input id="name-input" data-testid="input-1" />
        <label htmlFor="email-input">Email</label>
        <Input id="email-input" data-testid="input-2" type="email" />
        <Button data-testid="submit-btn">Submit</Button>
      </form>,
    );

    await user.tab();
    expect(screen.getByTestId('input-1')).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId('input-2')).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId('submit-btn')).toHaveFocus();
  });

  it('should activate Button with Enter key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<Button onClick={onClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    button.focus();

    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should activate Button with Space key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<Button onClick={onClick}>Press me</Button>);

    const button = screen.getByRole('button', { name: 'Press me' });
    button.focus();

    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should navigate Select with keyboard', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <label htmlFor="role-select">Role</label>
        <Select id="role-select" data-testid="role-select">
          <option value="BUYER">Buyer</option>
          <option value="SELLER">Seller</option>
          <option value="MANAGER">Manager</option>
        </Select>
      </div>,
    );

    await user.tab();
    expect(screen.getByTestId('role-select')).toHaveFocus();
  });

  it('should type in Input with keyboard', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <label htmlFor="typing-input">Type here</label>
        <Input id="typing-input" data-testid="typing-input" />
      </div>,
    );

    const input = screen.getByTestId('typing-input');
    await user.click(input);
    await user.keyboard('Hello World');

    expect(input).toHaveValue('Hello World');
  });
});
