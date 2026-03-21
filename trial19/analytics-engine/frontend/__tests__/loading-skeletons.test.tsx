import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';

import RootLoading from '@/app/loading';
import DashboardsLoading from '@/app/dashboards/loading';
import PipelinesLoading from '@/app/pipelines/loading';
import DataSourcesLoading from '@/app/data-sources/loading';
import LoginLoading from '@/app/login/loading';
import RegisterLoading from '@/app/register/loading';

const loadingComponents = [
  { name: 'RootLoading', Component: RootLoading },
  { name: 'DashboardsLoading', Component: DashboardsLoading },
  { name: 'PipelinesLoading', Component: PipelinesLoading },
  { name: 'DataSourcesLoading', Component: DataSourcesLoading },
  { name: 'LoginLoading', Component: LoginLoading },
  { name: 'RegisterLoading', Component: RegisterLoading },
];

describe('Loading skeletons', () => {
  loadingComponents.forEach(({ name, Component }) => {
    describe(name, () => {
      it('renders with role="status" and aria-busy', () => {
        render(<Component />);

        const status = screen.getByRole('status');
        expect(status).toBeInTheDocument();
        expect(status).toHaveAttribute('aria-busy', 'true');
      });

      it('has an aria-label', () => {
        render(<Component />);

        const status = screen.getByRole('status');
        expect(status).toHaveAttribute('aria-label');
      });

      it('passes accessibility checks', async () => {
        const { container } = render(<Component />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });
  });
});
