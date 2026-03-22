// TRACED: AE-TEST-005
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

describe('Keyboard Navigation', () => {
  it('should focus Button via Tab key', async () => {
    const user = userEvent.setup();
    render(<Button>Click me</Button>);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Click me' })).toHaveFocus();
  });

  it('should activate Button via Enter key', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should activate Button via Space key', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should focus Input via Tab key', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <label htmlFor="name">Name</label>
        <Input id="name" />
      </div>,
    );

    await user.tab();
    expect(screen.getByLabelText('Name')).toHaveFocus();
  });

  it('should type in Input after Tab focus', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <label htmlFor="email">Email</label>
        <Input id="email" />
      </div>,
    );

    await user.tab();
    await user.keyboard('test@example.com');
    expect(screen.getByLabelText('Email')).toHaveValue('test@example.com');
  });

  it('should navigate between multiple focusable elements', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </div>,
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Third' })).toHaveFocus();
  });
});
