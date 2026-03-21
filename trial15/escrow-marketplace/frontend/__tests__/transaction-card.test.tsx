import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { TransactionCard } from "@/components/transactions/transaction-card";
import { buildTransaction } from "./helpers";

expect.extend(toHaveNoViolations);

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("TransactionCard", () => {
  it("renders transaction title and description", () => {
    const tx = buildTransaction({
      title: "Custom Widget",
      description: "A very special widget",
    });

    render(<TransactionCard transaction={tx} />);

    expect(screen.getByText("Custom Widget")).toBeInTheDocument();
    expect(screen.getByText("A very special widget")).toBeInTheDocument();
  });

  it("displays the status badge", () => {
    const tx = buildTransaction({ status: "FUNDED" });

    render(<TransactionCard transaction={tx} />);

    expect(screen.getByText("FUNDED")).toBeInTheDocument();
  });

  it("formats and displays the amount", () => {
    const tx = buildTransaction({ amount: 15099, currency: "USD" });

    render(<TransactionCard transaction={tx} />);

    expect(screen.getByText("$150.99")).toBeInTheDocument();
  });

  it("shows buyer and seller names", () => {
    const tx = buildTransaction();

    render(<TransactionCard transaction={tx} />);

    expect(screen.getByText(/Alice Buyer/)).toBeInTheDocument();
    expect(screen.getByText(/Bob Seller/)).toBeInTheDocument();
  });

  it("links to the transaction detail page", () => {
    const tx = buildTransaction({ id: "tx-abc-123" });

    render(<TransactionCard transaction={tx} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/transactions/tx-abc-123");
  });

  it("passes axe accessibility checks", async () => {
    const tx = buildTransaction();
    const { container } = render(<TransactionCard transaction={tx} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
