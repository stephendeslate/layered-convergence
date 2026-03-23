// TRACED: EM-TKBD-001
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
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('Button should be activatable via Enter', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Button should be activatable via Space', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Input should be focusable via Tab', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Test input" />);

    await user.tab();
    expect(screen.getByPlaceholderText('Test input')).toHaveFocus();
  });

  it('Input should accept keyboard input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);

    await user.tab();
    await user.keyboard('Hello');
    expect(screen.getByPlaceholderText('Type here')).toHaveValue('Hello');
  });

  it('Multiple buttons should be navigable in order', async () => {
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

  it('Disabled button should not be focusable', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button disabled>Disabled</Button>
        <Button>Enabled</Button>
      </div>,
    );

    await user.tab();
    expect(screen.getByText('Enabled')).toHaveFocus();
  });
});
