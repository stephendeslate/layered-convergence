import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WidgetRenderer } from './WidgetRenderer';

describe('WidgetRenderer', () => {
  it('renders KPI widget with formatted value', () => {
    render(
      <WidgetRenderer
        type="kpi"
        data={[{ revenue: 12345 }]}
        config={{ metric: 'revenue' }}
        title="Total Revenue"
      />,
    );

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('12,345')).toBeInTheDocument();
  });

  it('renders unknown widget type with fallback message', () => {
    render(
      <WidgetRenderer
        type="nonexistent"
        data={[]}
        config={{}}
      />,
    );

    expect(screen.getByText(/Unknown widget type: nonexistent/)).toBeInTheDocument();
  });

  it('renders table widget with data rows', () => {
    render(
      <WidgetRenderer
        type="table"
        data={[
          { name: 'Alice', score: 95 },
          { name: 'Bob', score: 87 },
        ]}
        config={{
          columns: [
            { field: 'name', label: 'Name', sortable: true },
            { field: 'score', label: 'Score', sortable: true },
          ],
        }}
        title="Leaderboard"
      />,
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('95')).toBeInTheDocument();
  });
});
