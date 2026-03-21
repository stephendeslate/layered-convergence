import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

describe('Keyboard Navigation', () => {
  it('Tab moves focus between interactive elements', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Input data-testid="input-1" aria-label="First input" />
        <Button data-testid="btn-1">First</Button>
        <Button data-testid="btn-2">Second</Button>
      </div>,
    );

    await user.tab();
    expect(screen.getByTestId('input-1')).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId('btn-1')).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId('btn-2')).toHaveFocus();
  });

  it('Enter activates a focused button', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Space activates a focused button', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Press me</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Shift+Tab moves focus backwards', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button data-testid="btn-a">A</Button>
        <Button data-testid="btn-b">B</Button>
      </div>,
    );

    await user.tab();
    await user.tab();
    expect(screen.getByTestId('btn-b')).toHaveFocus();

    await user.tab({ shift: true });
    expect(screen.getByTestId('btn-a')).toHaveFocus();
  });

  it('disabled button is not focusable via tab', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button data-testid="btn-enabled">Enabled</Button>
        <Button data-testid="btn-disabled" disabled>Disabled</Button>
        <Button data-testid="btn-next">Next</Button>
      </div>,
    );

    await user.tab();
    expect(screen.getByTestId('btn-enabled')).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId('btn-next')).toHaveFocus();
  });
});
