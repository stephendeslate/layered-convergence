import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { DataSourceCard } from "@/components/dashboard/data-source-card";
import { PipelineCard } from "@/components/dashboard/pipeline-card";
import type { DataSource, Pipeline } from "@/lib/types";

expect.extend(toHaveNoViolations);

jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

const mockDataSource: DataSource = {
  id: "ds-001",
  name: "Production Database",
  type: "postgresql",
  config: { host: "db.example.com", port: "5432" },
  status: "connected",
  lastSyncAt: "2025-12-01T10:00:00Z",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-12-01T10:00:00Z",
};

const mockPipeline: Pipeline = {
  id: "pl-001",
  name: "ETL Pipeline",
  description: "Extract, transform, and load data from production",
  dataSourceId: "ds-001",
  schedule: "0 */6 * * *",
  status: "completed",
  lastRunAt: "2025-12-01T12:00:00Z",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-12-01T12:00:00Z",
};

describe("DataSourceCard", () => {
  it("renders data source information", () => {
    render(<DataSourceCard dataSource={mockDataSource} />);

    expect(screen.getByText("Production Database")).toBeInTheDocument();
    expect(screen.getByText("connected")).toBeInTheDocument();
    expect(screen.getByText("postgresql")).toBeInTheDocument();
  });

  it("links to the data source detail page", () => {
    render(<DataSourceCard dataSource={mockDataSource} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/data-sources/ds-001");
  });

  it("shows 'Never' when lastSyncAt is null", () => {
    const noSync: DataSource = { ...mockDataSource, lastSyncAt: null };
    render(<DataSourceCard dataSource={noSync} />);

    expect(screen.getByText("Never")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<DataSourceCard dataSource={mockDataSource} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("PipelineCard", () => {
  it("renders pipeline information", () => {
    render(<PipelineCard pipeline={mockPipeline} />);

    expect(screen.getByText("ETL Pipeline")).toBeInTheDocument();
    expect(screen.getByText("completed")).toBeInTheDocument();
    expect(
      screen.getByText(/Extract, transform, and load data/)
    ).toBeInTheDocument();
  });

  it("shows schedule when present", () => {
    render(<PipelineCard pipeline={mockPipeline} />);

    expect(screen.getByText("0 */6 * * *")).toBeInTheDocument();
  });

  it("shows 'Manual' when schedule is null", () => {
    const manualPipeline: Pipeline = { ...mockPipeline, schedule: null };
    render(<PipelineCard pipeline={manualPipeline} />);

    expect(screen.getByText("Manual")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<PipelineCard pipeline={mockPipeline} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
