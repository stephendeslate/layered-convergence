import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';

vi.mock('@/app/actions', () => ({
  createDataSource: vi.fn(),
}));

import { DataSourceForm } from '@/app/data-sources/data-source-form';

describe('DataSourceForm', () => {
  it('renders form with aria-label', () => {
    render(<DataSourceForm />);

    expect(screen.getByRole('form', { name: /create data source form/i })).toBeInTheDocument();
  });

  it('renders name input', () => {
    render(<DataSourceForm />);

    expect(screen.getByLabelText('Data source name')).toBeInTheDocument();
  });

  it('renders connection string input', () => {
    render(<DataSourceForm />);

    expect(screen.getByLabelText('Connection string')).toBeInTheDocument();
  });

  it('uses shadcn Select for type (not a visible native select)', () => {
    const { container } = render(<DataSourceForm />);

    expect(screen.getByLabelText('Select data source type')).toBeInTheDocument();
    // shadcn Select renders a combobox trigger button, not a visible native select
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    // The hidden native select used for form submission should have aria-hidden
    const nativeSelect = container.querySelector('select');
    expect(nativeSelect).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders submit button', () => {
    render(<DataSourceForm />);

    expect(screen.getByRole('button', { name: /add data source/i })).toBeInTheDocument();
  });

  it('passes accessibility checks', async () => {
    const { container } = render(<DataSourceForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
