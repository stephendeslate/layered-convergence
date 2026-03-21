import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { DashboardGrid } from "@/components/dashboards/dashboard-grid";
import type { Widget } from "@/lib/types";

expect.extend(toHaveNoViolations);

function createWidget(overrides: Partial<Widget> = {}): Widget {
  return {
    id: "w-1",
    dashboardId: "dash-1",
    title: "Revenue Chart",
    type: "line-chart",
    config: {
      dataSourceId: "ds-1",
      query: "SELECT * FROM metrics",
      refreshInterval: 30,
    },
    position: { x: 0, y: 0, width: 4, height: 3 },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    ...overrides,
  };
}

describe("DashboardGrid", () => {
  it("renders an empty state when no widgets are provided", () => {
    render(<DashboardGrid widgets={[]} />);
    expect(
      screen.getByText(/no widgets configured/i)
    ).toBeInTheDocument();
  });

  it("renders widget titles", () => {
    const widgets = [
      createWidget({ id: "w-1", title: "Monthly Revenue" }),
      createWidget({ id: "w-2", title: "User Growth" }),
    ];
    render(<DashboardGrid widgets={widgets} />);
    expect(screen.getByText("Monthly Revenue")).toBeInTheDocument();
    expect(screen.getByText("User Growth")).toBeInTheDocument();
  });

  it("renders widget type badges", () => {
    const widgets = [
      createWidget({ id: "w-1", type: "bar-chart" }),
    ];
    render(<DashboardGrid widgets={widgets} />);
    expect(screen.getByText("Bar Chart")).toBeInTheDocument();
  });

  it("renders refresh interval", () => {
    const widgets = [
      createWidget({ config: { dataSourceId: "ds-1", query: "q", refreshInterval: 60 } }),
    ];
    render(<DashboardGrid widgets={widgets} />);
    expect(screen.getByText("60s")).toBeInTheDocument();
  });

  it("renders the grid with a list role", () => {
    const widgets = [createWidget()];
    render(<DashboardGrid widgets={widgets} />);
    expect(screen.getByRole("list", { name: /dashboard widgets/i })).toBeInTheDocument();
  });

  it("has no accessibility violations with widgets", async () => {
    const widgets = [
      createWidget({ id: "w-1", title: "Widget A" }),
      createWidget({ id: "w-2", title: "Widget B", type: "pie-chart" }),
    ];
    const { container } = render(<DashboardGrid widgets={widgets} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations when empty", async () => {
    const { container } = render(<DashboardGrid widgets={[]} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
