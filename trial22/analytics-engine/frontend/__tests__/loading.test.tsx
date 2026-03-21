// [TRACED:TS-006] Loading component tests with accessibility validation

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Loading from '../app/loading';
import DashboardLoading from '../app/dashboard/loading';
import DataSourcesLoading from '../app/data-sources/loading';
import PipelinesLoading from '../app/pipelines/loading';
import LoginLoading from '../app/login/loading';

expect.extend(toHaveNoViolations);

describe('Loading components', () => {
  const loadingComponents = [
    { name: 'Root Loading', Component: Loading, text: 'Loading page content...' },
    { name: 'Dashboard Loading', Component: DashboardLoading, text: 'Loading dashboards...' },
    { name: 'Data Sources Loading', Component: DataSourcesLoading, text: 'Loading data sources...' },
    { name: 'Pipelines Loading', Component: PipelinesLoading, text: 'Loading pipelines...' },
    { name: 'Login Loading', Component: LoginLoading, text: 'Loading login page...' },
  ];

  loadingComponents.forEach(({ name, Component, text }) => {
    describe(name, () => {
      it('has role="status" attribute', () => {
        render(<Component />);
        const statusElement = screen.getByRole('status');
        expect(statusElement).toBeDefined();
      });

      it('has aria-busy="true" attribute', () => {
        render(<Component />);
        const statusElement = screen.getByRole('status');
        expect(statusElement.getAttribute('aria-busy')).toBe('true');
      });

      it('has screen reader text', () => {
        render(<Component />);
        expect(screen.getByText(text)).toBeDefined();
      });

      it('passes axe accessibility checks', async () => {
        const { container } = render(<Component />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });
  });
});
