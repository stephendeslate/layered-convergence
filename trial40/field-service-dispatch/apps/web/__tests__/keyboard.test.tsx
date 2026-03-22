// TRACED: FD-SEC-002 — Keyboard interaction tests with userEvent
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

describe('Keyboard Interactions', () => {
  it('Button should be focusable via Tab', async () => {
    const user = userEvent.setup();
    render(<Button>Submit</Button>);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus();
  });

  it('Button should activate on Enter key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Submit</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Button should activate on Space key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Submit</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Disabled button should not be focusable', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Button disabled>Disabled</Button>
        <Button>Enabled</Button>
      </>,
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Enabled' })).toHaveFocus();
  });

  it('Input should receive focus on Tab', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);

    await user.tab();
    expect(screen.getByPlaceholderText('Type here')).toHaveFocus();
  });

  it('Input should accept typed text', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);

    await user.tab();
    await user.type(screen.getByPlaceholderText('Type here'), 'Hello');
    expect(screen.getByPlaceholderText('Type here')).toHaveValue('Hello');
  });
});
