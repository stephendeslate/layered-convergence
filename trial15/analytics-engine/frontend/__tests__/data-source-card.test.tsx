import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { DataSourceCard } from "@/components/data-sources/data-source-card";
import type { DataSource } from "@/lib/types";

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

function createDataSource(overrides: Partial<DataSource> = {}): DataSource {
  return {
    id: "ds-1",
    name: "Production Database",
    type: "postgresql",
    config: {},
    status: "connected",
    lastSyncAt: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    ...overrides,
  };
}

describe("DataSourceCard", () => {
  it("renders the data source name", () => {
    const dataSource = createDataSource({ name: "My Data Source" });
    render(<DataSourceCard dataSource={dataSource} />);
    expect(screen.getByText("My Data Source")).toBeInTheDocument();
  });

  it("renders the type", () => {
    const dataSource = createDataSource({ type: "mysql" });
    render(<DataSourceCard dataSource={dataSource} />);
    expect(screen.getByText("mysql")).toBeInTheDocument();
  });

  it("renders a connected status badge", () => {
    const dataSource = createDataSource({ status: "connected" });
    render(<DataSourceCard dataSource={dataSource} />);
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });

  it("renders an error status badge", () => {
    const dataSource = createDataSource({ status: "error" });
    render(<DataSourceCard dataSource={dataSource} />);
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("renders a syncing status badge", () => {
    const dataSource = createDataSource({ status: "syncing" });
    render(<DataSourceCard dataSource={dataSource} />);
    expect(screen.getByText("Syncing")).toBeInTheDocument();
  });

  it("renders 'Never' when lastSyncAt is null", () => {
    const dataSource = createDataSource({ lastSyncAt: null });
    render(<DataSourceCard dataSource={dataSource} />);
    expect(screen.getByText("Never")).toBeInTheDocument();
  });

  it("links to the data source detail page", () => {
    const dataSource = createDataSource({ id: "ds-42" });
    render(<DataSourceCard dataSource={dataSource} />);
    const link = screen.getByRole("link", { name: /view details/i });
    expect(link).toHaveAttribute("href", "/data-sources/ds-42");
  });

  it("has no accessibility violations", async () => {
    const dataSource = createDataSource();
    const { container } = render(<DataSourceCard dataSource={dataSource} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
