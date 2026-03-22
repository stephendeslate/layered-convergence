// TRACED:AE-SEC-06 — Keyboard navigation tests with userEvent Tab, Enter, Space

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

describe('Keyboard Navigation', () => {
  it('should focus Button with Tab key', async () => {
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

  it('should activate Button with Enter key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Submit</Button>);

    await user.tab();
    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should activate Button with Space key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Action</Button>);

    await user.tab();
    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should focus Input with Tab key', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>Before</Button>
        <Input data-testid="email-input" placeholder="Email" />
      </div>,
    );

    await user.tab();
    expect(screen.getByText('Before')).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId('email-input')).toHaveFocus();
  });

  it('should type into Input after Tab focus', async () => {
    const user = userEvent.setup();
    render(<Input data-testid="name-input" placeholder="Name" />);

    await user.tab();
    await user.type(screen.getByTestId('name-input'), 'Analytics');

    expect(screen.getByTestId('name-input')).toHaveValue('Analytics');
  });

  it('should skip disabled buttons during Tab navigation', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>Enabled</Button>
        <Button disabled>Disabled</Button>
        <Button>Also Enabled</Button>
      </div>,
    );

    await user.tab();
    expect(screen.getByText('Enabled')).toHaveFocus();

    await user.tab();
    expect(screen.getByText('Also Enabled')).toHaveFocus();
  });
});
