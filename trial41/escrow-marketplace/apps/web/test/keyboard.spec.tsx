// TRACED:EM-A11Y-02 keyboard navigation tests with userEvent
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
    render(<Button onClick={onClick}>Submit</Button>);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Button should be activatable via Space', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Submit</Button>);
    await user.tab();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Input should be focusable via Tab', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <label htmlFor="email">Email</label>
        <Input id="email" type="email" />
      </div>,
    );
    await user.tab();
    expect(screen.getByLabelText('Email')).toHaveFocus();
  });

  it('Multiple buttons should navigate with Tab', async () => {
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

  it('disabled Button should not be focusable', async () => {
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
