// TRACED: FD-TEST-UI-002 — Keyboard navigation tests with userEvent
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

describe('Keyboard Navigation', () => {
  it('Button can be activated with Enter key', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    const button = screen.getByRole('button', { name: 'Submit' });
    button.focus();
    await userEvent.keyboard('{Enter}');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('Button can be activated with Space key', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    const button = screen.getByRole('button', { name: 'Submit' });
    button.focus();
    await userEvent.keyboard(' ');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('Tab navigates between focusable elements', async () => {
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </div>,
    );

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Third' })).toHaveFocus();
  });

  it('Shift+Tab navigates backwards', async () => {
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
      </div>,
    );

    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();

    await userEvent.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
  });

  it('Input accepts typed text', async () => {
    render(
      <div>
        <Label htmlFor="test-field">Name</Label>
        <Input id="test-field" />
      </div>,
    );

    const input = screen.getByLabelText('Name');
    await userEvent.type(input, 'Field Technician');

    expect(input).toHaveValue('Field Technician');
  });

  it('disabled Button does not respond to keyboard', async () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);

    const button = screen.getByRole('button', { name: 'Disabled' });
    button.focus();
    await userEvent.keyboard('{Enter}');

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('Input can be tabbed to and typed in', async () => {
    render(
      <div>
        <Button>Before</Button>
        <Input placeholder="Enter value" />
      </div>,
    );

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();

    await userEvent.tab();
    const input = screen.getByPlaceholderText('Enter value');
    expect(input).toHaveFocus();

    await userEvent.type(input, 'test value');
    expect(input).toHaveValue('test value');
  });
});
