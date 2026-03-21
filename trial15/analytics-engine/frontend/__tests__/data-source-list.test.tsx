import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { DataSourceCard } from "@/components/dashboard/data-source-card";
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

const dataSources: DataSource[] = [
  {
    id: "ds-1",
    name: "Postgres Production",
    type: "postgresql",
    config: { host: "prod-db.example.com" },
    status: "connected",
    lastSyncAt: "2025-11-15T08:00:00Z",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-11-15T08:00:00Z",
  },
  {
    id: "ds-2",
    name: "CSV Import",
    type: "csv",
    config: {},
    status: "error",
    lastSyncAt: null,
    createdAt: "2025-06-01T00:00:00Z",
    updatedAt: "2025-06-01T00:00:00Z",
  },
  {
    id: "ds-3",
    name: "API Connector",
    type: "api",
    config: { url: "https://api.example.com" },
    status: "syncing",
    lastSyncAt: "2025-12-10T14:30:00Z",
    createdAt: "2025-03-01T00:00:00Z",
    updatedAt: "2025-12-10T14:30:00Z",
  },
];

describe("DataSourceList", () => {
  it("renders multiple data source cards", () => {
    render(
      <div>
        {dataSources.map((ds) => (
          <DataSourceCard key={ds.id} dataSource={ds} />
        ))}
      </div>
    );

    expect(screen.getByText("Postgres Production")).toBeInTheDocument();
    expect(screen.getByText("CSV Import")).toBeInTheDocument();
    expect(screen.getByText("API Connector")).toBeInTheDocument();
  });

  it("shows correct status badges for each data source", () => {
    render(
      <div>
        {dataSources.map((ds) => (
          <DataSourceCard key={ds.id} dataSource={ds} />
        ))}
      </div>
    );

    expect(screen.getByText("connected")).toBeInTheDocument();
    expect(screen.getByText("error")).toBeInTheDocument();
    expect(screen.getByText("syncing")).toBeInTheDocument();
  });

  it("renders correct links for each data source", () => {
    render(
      <div>
        {dataSources.map((ds) => (
          <DataSourceCard key={ds.id} dataSource={ds} />
        ))}
      </div>
    );

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/data-sources/ds-1");
    expect(links[1]).toHaveAttribute("href", "/data-sources/ds-2");
    expect(links[2]).toHaveAttribute("href", "/data-sources/ds-3");
  });

  it("shows the data source type", () => {
    render(
      <div>
        {dataSources.map((ds) => (
          <DataSourceCard key={ds.id} dataSource={ds} />
        ))}
      </div>
    );

    expect(screen.getByText("postgresql")).toBeInTheDocument();
    expect(screen.getByText("csv")).toBeInTheDocument();
    expect(screen.getByText("api")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <div>
        {dataSources.map((ds) => (
          <DataSourceCard key={ds.id} dataSource={ds} />
        ))}
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
