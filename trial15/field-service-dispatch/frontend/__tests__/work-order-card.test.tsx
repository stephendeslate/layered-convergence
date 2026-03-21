import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { WorkOrderCard } from "@/components/work-orders/work-order-card";
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

const mockWorkOrder: WorkOrder = {
  id: "wo-1",
  companyId: "co-1",
  title: "Fix HVAC Unit",
  description: "AC not cooling properly",
  status: "ASSIGNED",
  priority: "HIGH",
  customerId: "cu-1",
  customer: {
    id: "cu-1",
    companyId: "co-1",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "555-0101",
    address: "456 Oak Ave",
    latitude: null,
    longitude: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  technicianId: "tech-1",
  technician: {
    id: "tech-1",
    companyId: "co-1",
    name: "Bob Technician",
    email: "bob@example.com",
    phone: "555-0202",
    skills: ["HVAC", "Plumbing"],
    availability: "BUSY",
    latitude: null,
    longitude: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  scheduledDate: "2024-06-15T09:00:00Z",
  estimatedDuration: 120,
  address: "123 Main St, Springfield",
  latitude: null,
  longitude: null,
  notes: null,
  completedAt: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("WorkOrderCard", () => {
  it("renders the work order title", () => {
    render(<WorkOrderCard workOrder={mockWorkOrder} />);
    expect(screen.getByText("Fix HVAC Unit")).toBeInTheDocument();
  });

  it("renders the work order status", () => {
    render(<WorkOrderCard workOrder={mockWorkOrder} />);
    expect(screen.getByText("ASSIGNED")).toBeInTheDocument();
  });

  it("renders the priority badge", () => {
    render(<WorkOrderCard workOrder={mockWorkOrder} />);
    expect(screen.getByText("HIGH")).toBeInTheDocument();
  });

  it("renders the customer name", () => {
    render(<WorkOrderCard workOrder={mockWorkOrder} />);
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("renders the technician name", () => {
    render(<WorkOrderCard workOrder={mockWorkOrder} />);
    expect(screen.getByText("Bob Technician")).toBeInTheDocument();
  });

  it("renders the address", () => {
    render(<WorkOrderCard workOrder={mockWorkOrder} />);
    expect(screen.getByText("123 Main St, Springfield")).toBeInTheDocument();
  });

  it("links to the work order detail page", () => {
    render(<WorkOrderCard workOrder={mockWorkOrder} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/work-orders/wo-1");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<WorkOrderCard workOrder={mockWorkOrder} />);
    const results = await axe.run(container);
    expect(results).toHaveNoViolations();
  });
});
