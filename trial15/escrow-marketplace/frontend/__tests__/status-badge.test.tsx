import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { StatusBadge } from "@/components/transactions/status-badge";
import type { TransactionStatus } from "@/lib/types";

expect.extend(toHaveNoViolations);

const allStatuses: TransactionStatus[] = [
  "PENDING",
  "FUNDED",
  "SHIPPED",
  "DELIVERED",
  "RELEASED",
  "CANCELLED",
  "DISPUTED",
  "RESOLVED",
  "REFUNDED",
];

describe("StatusBadge", () => {
  it.each(allStatuses)("renders %s status correctly", (status) => {
    render(<StatusBadge status={status} />);

    const expected = status.charAt(0) + status.slice(1).toLowerCase();
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it("applies correct color classes for PENDING", () => {
    const { container } = render(<StatusBadge status="PENDING" />);
    const badge = container.querySelector("span");
    expect(badge?.className).toContain("bg-yellow-100");
    expect(badge?.className).toContain("text-yellow-800");
  });

  it("applies correct color classes for FUNDED", () => {
    const { container } = render(<StatusBadge status="FUNDED" />);
    const badge = container.querySelector("span");
    expect(badge?.className).toContain("bg-blue-100");
    expect(badge?.className).toContain("text-blue-800");
  });

  it("applies correct color classes for DISPUTED", () => {
    const { container } = render(<StatusBadge status="DISPUTED" />);
    const badge = container.querySelector("span");
    expect(badge?.className).toContain("bg-red-100");
    expect(badge?.className).toContain("text-red-800");
  });

  it("applies correct color classes for RELEASED", () => {
    const { container } = render(<StatusBadge status="RELEASED" />);
    const badge = container.querySelector("span");
    expect(badge?.className).toContain("bg-green-100");
    expect(badge?.className).toContain("text-green-800");
  });

  it("passes axe accessibility checks", async () => {
    const { container } = render(<StatusBadge status="PENDING" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
