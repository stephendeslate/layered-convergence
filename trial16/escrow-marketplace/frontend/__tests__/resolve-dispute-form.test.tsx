import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ResolveDisputeForm } from '@/app/disputes/[id]/resolve-form';

expect.extend(toHaveNoViolations);

jest.mock('@/app/actions', () => ({
  resolveDispute: jest.fn().mockResolvedValue(undefined),
}));

describe('ResolveDisputeForm', () => {
  it('should render resolution select', () => {
    render(<ResolveDisputeForm disputeId="dispute-1" />);
    expect(screen.getByLabelText(/resolution/i)).toBeInTheDocument();
  });

  it('should render RELEASE and REFUND options', () => {
    render(<ResolveDisputeForm disputeId="dispute-1" />);
    const select = screen.getByLabelText(/resolution/i);
    const options = select.querySelectorAll('option');
    const values = Array.from(options).map((o) => o.value);
    expect(values).toContain('RELEASE');
    expect(values).toContain('REFUND');
  });

  it('should render resolve button', () => {
    render(<ResolveDisputeForm disputeId="dispute-1" />);
    expect(
      screen.getByRole('button', { name: /resolve dispute/i }),
    ).toBeInTheDocument();
  });

  it('should allow selecting a resolution', async () => {
    const user = userEvent.setup();
    render(<ResolveDisputeForm disputeId="dispute-1" />);
    const select = screen.getByLabelText(/resolution/i);
    await user.selectOptions(select, 'RELEASE');
    expect(select).toHaveValue('RELEASE');
  });

  it('should allow selecting REFUND resolution', async () => {
    const user = userEvent.setup();
    render(<ResolveDisputeForm disputeId="dispute-1" />);
    const select = screen.getByLabelText(/resolution/i);
    await user.selectOptions(select, 'REFUND');
    expect(select).toHaveValue('REFUND');
  });

  it('should have a disabled placeholder option', () => {
    render(<ResolveDisputeForm disputeId="dispute-1" />);
    const select = screen.getByLabelText(/resolution/i);
    const placeholder = select.querySelector('option[disabled]');
    expect(placeholder).not.toBeNull();
    expect(placeholder?.textContent).toContain('Select resolution');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <ResolveDisputeForm disputeId="dispute-1" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
