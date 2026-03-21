import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import RootLoading from '@/app/loading';
import DashboardsLoading from '@/app/dashboards/loading';
import DashboardDetailLoading from '@/app/dashboards/[id]/loading';
import DataSourcesLoading from '@/app/data-sources/loading';
import DataSourceDetailLoading from '@/app/data-sources/[id]/loading';
import PipelinesLoading from '@/app/pipelines/loading';
import EmbedsLoading from '@/app/embeds/loading';
import LoginLoading from '@/app/(auth)/login/loading';
import RegisterLoading from '@/app/(auth)/register/loading';

const loadingComponents = [
  { name: 'RootLoading', Component: RootLoading },
  { name: 'DashboardsLoading', Component: DashboardsLoading },
  { name: 'DashboardDetailLoading', Component: DashboardDetailLoading },
  { name: 'DataSourcesLoading', Component: DataSourcesLoading },
  { name: 'DataSourceDetailLoading', Component: DataSourceDetailLoading },
  { name: 'PipelinesLoading', Component: PipelinesLoading },
  { name: 'EmbedsLoading', Component: EmbedsLoading },
  { name: 'LoginLoading', Component: LoginLoading },
  { name: 'RegisterLoading', Component: RegisterLoading },
];

describe('Loading Skeletons', () => {
  loadingComponents.forEach(({ name, Component }) => {
    it(`${name} renders without error`, () => {
      const { container } = render(<Component />);
      expect(container).toBeTruthy();
    });

    it(`${name} has aria-busy attribute`, () => {
      const { container } = render(<Component />);
      const busyElement = container.querySelector('[aria-busy="true"]');
      expect(busyElement).toBeTruthy();
    });

    it(`${name} passes accessibility checks`, async () => {
      const { container } = render(<Component />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
