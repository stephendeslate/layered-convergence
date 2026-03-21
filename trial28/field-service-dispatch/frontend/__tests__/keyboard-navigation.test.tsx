import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

describe('Keyboard Navigation Tests', () => {
  it('should tab between interactive elements in order', async () => {
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

  it('should activate button with Enter key', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Dispatch</Button>);

    await user.tab();
    await user.keyboard('{Enter}');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should activate button with Space key', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Assign</Button>);

    await user.tab();
    await user.keyboard(' ');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should reverse focus with Shift+Tab', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
      </div>,
    );

    await user.tab();
    await user.tab();
    expect(screen.getByText('Second')).toHaveFocus();

    await user.tab({ shift: true });
    expect(screen.getByText('First')).toHaveFocus();
  });

  it('should skip disabled elements during tab navigation', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>Active</Button>
        <Button disabled>Disabled</Button>
        <Input placeholder="Search work orders" />
      </div>,
    );

    await user.tab();
    expect(screen.getByText('Active')).toHaveFocus();

    await user.tab();
    expect(screen.getByPlaceholderText('Search work orders')).toHaveFocus();
  });
});
