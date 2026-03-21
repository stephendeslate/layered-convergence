import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { WorkOrderTimeline } from "@/components/work-orders/work-order-timeline";


describe("WorkOrderTimeline", () => {
  it("renders all 9 work order statuses", () => {
    render(<WorkOrderTimeline currentStatus="CREATED" />);

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

  it("marks completed statuses for IN_PROGRESS", () => {
    const { container } = render(
      <WorkOrderTimeline currentStatus="IN_PROGRESS" />
    );

    const steps = container.querySelectorAll("li");
    expect(steps).toHaveLength(9);

    // CREATED, ASSIGNED, EN_ROUTE should be completed (indices 0, 1, 2)
    // IN_PROGRESS should be current (index 3)
    const currentStep = steps[3].querySelector("[aria-current='step']");
    expect(currentStep).toBeInTheDocument();
  });

  it("marks the current step with aria-current", () => {
    const { container } = render(
      <WorkOrderTimeline currentStatus="COMPLETED" />
    );

    const currentMarker = container.querySelector("[aria-current='step']");
    expect(currentMarker).toBeInTheDocument();
  });

  it("renders the navigation landmark", () => {
    render(<WorkOrderTimeline currentStatus="ASSIGNED" />);
    expect(
      screen.getByRole("navigation", { name: /work order progress/i })
    ).toBeInTheDocument();
  });

  it("uses the correct test id", () => {
    render(<WorkOrderTimeline currentStatus="CREATED" />);
    expect(screen.getByTestId("work-order-timeline")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <WorkOrderTimeline currentStatus="EN_ROUTE" />
    );
    const results = await axe.run(container);
    expect(results).toHaveNoViolations();
  });
});
