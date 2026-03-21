import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { StatusBoard } from "@/components/work-orders/status-board";
import type { WorkOrder } from "@/lib/types";


vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

function createWorkOrder(overrides: Partial<WorkOrder> = {}): WorkOrder {
  return {
    id: "wo-1",
    companyId: "co-1",
    title: "Test Work Order",
    description: "Test description",
    status: "CREATED",
    priority: "MEDIUM",
    customerId: "cu-1",
    technicianId: null,
    scheduledDate: null,
    estimatedDuration: null,
    address: "123 Test St",
    latitude: null,
    longitude: null,
    notes: null,
    completedAt: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("StatusBoard", () => {
  it("renders the status board with all status columns", () => {
    render(<StatusBoard workOrders={[]} />);

    expect(screen.getByText("CREATED")).toBeInTheDocument();
    expect(screen.getByText("ASSIGNED")).toBeInTheDocument();
    expect(screen.getByText("EN ROUTE")).toBeInTheDocument();
    expect(screen.getByText("IN PROGRESS")).toBeInTheDocument();
    expect(screen.getByText("ON HOLD")).toBeInTheDocument();
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
    expect(screen.getByText("INVOICED")).toBeInTheDocument();
    expect(screen.getByText("PAID")).toBeInTheDocument();
    expect(screen.getByText("CLOSED")).toBeInTheDocument();
  });

  it("shows work order counts for each status", () => {
    const workOrders = [
      createWorkOrder({ id: "wo-1", status: "CREATED" }),
      createWorkOrder({ id: "wo-2", status: "CREATED" }),
      createWorkOrder({ id: "wo-3", status: "IN_PROGRESS" }),
    ];

    render(<StatusBoard workOrders={workOrders} />);

    const testIdBoard = screen.getByTestId("status-board");
    expect(testIdBoard).toBeInTheDocument();
  });

  it("renders work order cards in the correct columns", () => {
    const workOrders = [
      createWorkOrder({
        id: "wo-1",
        title: "Created Order",
        status: "CREATED",
      }),
      createWorkOrder({
        id: "wo-2",
        title: "Progress Order",
        status: "IN_PROGRESS",
      }),
    ];

    render(<StatusBoard workOrders={workOrders} />);

    expect(screen.getByText("Created Order")).toBeInTheDocument();
    expect(screen.getByText("Progress Order")).toBeInTheDocument();
  });

  it("shows empty message for columns with no work orders", () => {
    render(<StatusBoard workOrders={[]} />);

    const emptyMessages = screen.getAllByText("No work orders");
    expect(emptyMessages.length).toBe(9);
  });

  it("has no accessibility violations", async () => {
    const workOrders = [
      createWorkOrder({ id: "wo-1", status: "CREATED", title: "Test WO" }),
    ];

    const { container } = render(<StatusBoard workOrders={workOrders} />);
    const results = await axe.run(container);
    expect(results).toHaveNoViolations();
  });
});
