import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { AvailabilityBadge } from "@/components/technicians/availability-badge";


describe("AvailabilityBadge", () => {
  it("renders Available state correctly", () => {
    render(<AvailabilityBadge availability="AVAILABLE" />);
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByTestId("availability-badge")).toBeInTheDocument();
  });

  it("renders Busy state correctly", () => {
    render(<AvailabilityBadge availability="BUSY" />);
    expect(screen.getByText("Busy")).toBeInTheDocument();
  });

  it("renders Offline state correctly", () => {
    render(<AvailabilityBadge availability="OFFLINE" />);
    expect(screen.getByText("Offline")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <AvailabilityBadge availability="AVAILABLE" className="custom-class" />
    );
    const badge = screen.getByTestId("availability-badge");
    expect(badge.className).toContain("custom-class");
  });

  it("has correct styling for AVAILABLE state", () => {
    render(<AvailabilityBadge availability="AVAILABLE" />);
    const badge = screen.getByTestId("availability-badge");
    expect(badge.className).toContain("text-green-700");
  });

  it("has correct styling for BUSY state", () => {
    render(<AvailabilityBadge availability="BUSY" />);
    const badge = screen.getByTestId("availability-badge");
    expect(badge.className).toContain("text-yellow-700");
  });

  it("has correct styling for OFFLINE state", () => {
    render(<AvailabilityBadge availability="OFFLINE" />);
    const badge = screen.getByTestId("availability-badge");
    expect(badge.className).toContain("text-gray-600");
  });

  it("has no accessibility violations for AVAILABLE", async () => {
    const { container } = render(
      <AvailabilityBadge availability="AVAILABLE" />
    );
    const results = await axe.run(container);
    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations for BUSY", async () => {
    const { container } = render(<AvailabilityBadge availability="BUSY" />);
    const results = await axe.run(container);
    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations for OFFLINE", async () => {
    const { container } = render(
      <AvailabilityBadge availability="OFFLINE" />
    );
    const results = await axe.run(container);
    expect(results).toHaveNoViolations();
  });
});
