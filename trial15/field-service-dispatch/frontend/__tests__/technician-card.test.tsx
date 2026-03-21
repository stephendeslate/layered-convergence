import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { TechnicianCard } from "@/components/technicians/technician-card";
import type { Technician } from "@/lib/types";


vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const mockTechnician: Technician = {
  id: "tech-1",
  companyId: "co-1",
  name: "Alice Johnson",
  email: "alice@example.com",
  phone: "555-0303",
  skills: ["Electrical", "HVAC"],
  availability: "AVAILABLE",
  latitude: 40.7128,
  longitude: -74.006,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("TechnicianCard", () => {
  it("renders the technician name", () => {
    render(<TechnicianCard technician={mockTechnician} />);
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
  });

  it("renders the technician email", () => {
    render(<TechnicianCard technician={mockTechnician} />);
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("renders the technician phone", () => {
    render(<TechnicianCard technician={mockTechnician} />);
    expect(screen.getByText("555-0303")).toBeInTheDocument();
  });

  it("renders technician skills", () => {
    render(<TechnicianCard technician={mockTechnician} />);
    expect(screen.getByText("Electrical")).toBeInTheDocument();
    expect(screen.getByText("HVAC")).toBeInTheDocument();
  });

  it("renders availability status", () => {
    render(<TechnicianCard technician={mockTechnician} />);
    expect(screen.getByText("Available")).toBeInTheDocument();
  });

  it("links to the technician detail page", () => {
    render(<TechnicianCard technician={mockTechnician} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/technicians/tech-1");
  });

  it("renders location when coordinates are available", () => {
    render(<TechnicianCard technician={mockTechnician} />);
    expect(screen.getByText(/40\.7128/)).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <TechnicianCard technician={mockTechnician} />
    );
    const results = await axe.run(container);
    expect(results).toHaveNoViolations();
  });
});
