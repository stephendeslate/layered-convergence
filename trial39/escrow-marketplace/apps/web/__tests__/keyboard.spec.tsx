// TRACED: EM-TEST-009 — Keyboard navigation tests with userEvent
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

describe('Keyboard Navigation', () => {
  it('should focus Button via Tab and activate via Enter', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Submit</Button>);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should focus Button via Tab and activate via Space', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Action</Button>);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Action' })).toHaveFocus();

    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should tab through multiple form elements in order', async () => {
    const user = userEvent.setup();

    render(
      <form>
        <Label htmlFor="name-input">Name</Label>
        <Input id="name-input" placeholder="Name" />
        <Label htmlFor="email-input">Email</Label>
        <Input id="email-input" placeholder="Email" />
        <Button type="submit">Submit</Button>
      </form>,
    );

    await user.tab();
    expect(screen.getByPlaceholderText('Name')).toHaveFocus();

    await user.tab();
    expect(screen.getByPlaceholderText('Email')).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus();
  });

  it('should not activate disabled Button', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button disabled onClick={handleClick}>Disabled</Button>);

    await user.tab();
    await user.keyboard('{Enter}');

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should handle Input typing with keyboard', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Label htmlFor="kb-input">Test</Label>
        <Input id="kb-input" />
      </div>,
    );

    await user.tab();
    await user.type(screen.getByLabelText('Test'), 'hello world');

    expect(screen.getByLabelText('Test')).toHaveValue('hello world');
  });
});
