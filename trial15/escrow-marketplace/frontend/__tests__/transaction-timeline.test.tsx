import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TransactionTimeline } from "@/components/transactions/transaction-timeline";
import { buildTransaction } from "./helpers";
import { runAxe } from "./helpers";

describe("TransactionTimeline", () => {
  it("renders all timeline steps", () => {
    const tx = buildTransaction({ status: "PENDING" });

    render(<TransactionTimeline transaction={tx} />);

    expect(screen.getByText("Created")).toBeInTheDocument();
    expect(screen.getByText("Funded")).toBeInTheDocument();
    expect(screen.getByText("Shipped")).toBeInTheDocument();
    expect(screen.getByText("Delivered")).toBeInTheDocument();
    expect(screen.getByText("Released")).toBeInTheDocument();
  });

  it("marks completed steps for a SHIPPED transaction", () => {
    const tx = buildTransaction({
      status: "SHIPPED",
      fundedAt: "2025-01-15T12:00:00Z",
      shippedAt: "2025-01-16T12:00:00Z",
    });

    render(<TransactionTimeline transaction={tx} />);

    const createdStep = screen.getByLabelText("Created: completed");
    expect(createdStep).toBeInTheDocument();

    const fundedStep = screen.getByLabelText("Funded: completed");
    expect(fundedStep).toBeInTheDocument();

    const shippedStep = screen.getByLabelText("Shipped: current");
    expect(shippedStep).toBeInTheDocument();
  });

  it("shows cancelled notice for cancelled transactions", () => {
    const tx = buildTransaction({
      status: "CANCELLED",
      cancelledAt: "2025-01-15T14:00:00Z",
    });

    render(<TransactionTimeline transaction={tx} />);

    expect(screen.getByText(/cancelled/i)).toBeInTheDocument();
  });

  it("shows disputed notice for disputed transactions", () => {
    const tx = buildTransaction({
      status: "DISPUTED",
      fundedAt: "2025-01-15T12:00:00Z",
      disputedAt: "2025-01-16T10:00:00Z",
    });

    render(<TransactionTimeline transaction={tx} />);

    expect(screen.getByText(/under dispute/i)).toBeInTheDocument();
  });

  it("shows refunded notice for refunded transactions", () => {
    const tx = buildTransaction({ status: "REFUNDED" });

    render(<TransactionTimeline transaction={tx} />);

    expect(screen.getByText(/refunded/i)).toBeInTheDocument();
  });

  it("has a list role for the timeline", () => {
    const tx = buildTransaction({ status: "FUNDED" });

    render(<TransactionTimeline transaction={tx} />);

    expect(screen.getByRole("list", { name: /transaction timeline/i })).toBeInTheDocument();
  });

  it("passes accessibility checks", async () => {
    const tx = buildTransaction({
      status: "DELIVERED",
      fundedAt: "2025-01-15T12:00:00Z",
      shippedAt: "2025-01-16T12:00:00Z",
      deliveredAt: "2025-01-17T12:00:00Z",
    });
    const { container } = render(<TransactionTimeline transaction={tx} />);
    await runAxe(container);
  });
});
