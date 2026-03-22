// TRACED: AE-TEST-08
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

describe('Keyboard Navigation', () => {
  it('should focus buttons via Tab key', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Button data-testid="btn-1">First</Button>
        <Button data-testid="btn-2">Second</Button>
      </div>,
    );

    await user.tab();
    expect(screen.getByTestId('btn-1')).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId('btn-2')).toHaveFocus();
  });

  it('should activate button via Enter key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<Button onClick={onClick}>Press me</Button>);

    await user.tab();
    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should activate button via Space key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<Button onClick={onClick}>Press me</Button>);

    await user.tab();
    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should focus input fields via Tab key', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" data-testid="email-input" />
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" data-testid="password-input" />
      </div>,
    );

    await user.tab();
    expect(screen.getByTestId('email-input')).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId('password-input')).toHaveFocus();
  });

  it('should type into focused input field', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" data-testid="name-input" />
      </div>,
    );

    await user.tab();
    await user.keyboard('Jane Doe');

    expect(screen.getByTestId('name-input')).toHaveValue('Jane Doe');
  });

  it('should skip disabled buttons during tab navigation', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Button data-testid="btn-1">First</Button>
        <Button data-testid="btn-disabled" disabled>
          Disabled
        </Button>
        <Button data-testid="btn-3">Third</Button>
      </div>,
    );

    await user.tab();
    expect(screen.getByTestId('btn-1')).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId('btn-3')).toHaveFocus();
  });
});
