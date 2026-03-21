import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { buildPayout } from "./helpers";
import { runAxe } from "./helpers";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import type { Payout } from "@/lib/types";

function PayoutTableView({ payouts }: { payouts: Payout[] }) {
  if (payouts.length === 0) {
    return <p>No payouts yet</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Payout ID</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Completed</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payouts.map((payout) => (
          <TableRow key={payout.id}>
            <TableCell>{payout.id.slice(0, 8)}...</TableCell>
            <TableCell>
              {formatCurrency(payout.amount, payout.currency)}
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(payout.status)}>
                {payout.status}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(payout.createdAt)}</TableCell>
            <TableCell>
              {payout.completedAt ? formatDate(payout.completedAt) : "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

describe("PayoutTable", () => {
  it("renders table headers", () => {
    const payouts = [buildPayout()];

    render(<PayoutTableView payouts={payouts} />);

    expect(screen.getByText("Payout ID")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Created")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("renders payout amount formatted as currency", () => {
    const payouts = [buildPayout({ amount: 9999, currency: "USD" })];

    render(<PayoutTableView payouts={payouts} />);

    expect(screen.getByText("$99.99")).toBeInTheDocument();
  });

  it("renders payout status badge", () => {
    const payouts = [buildPayout({ status: "COMPLETED" })];

    render(<PayoutTableView payouts={payouts} />);

    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
  });

  it("shows dash when completedAt is null", () => {
    const payouts = [buildPayout({ completedAt: null })];

    render(<PayoutTableView payouts={payouts} />);

    const cells = screen.getAllByRole("cell");
    const lastCell = cells[cells.length - 1];
    expect(lastCell.textContent).toBe("-");
  });

  it("renders empty state when no payouts", () => {
    render(<PayoutTableView payouts={[]} />);

    expect(screen.getByText("No payouts yet")).toBeInTheDocument();
  });

  it("renders multiple payouts", () => {
    const payouts = [
      buildPayout({ amount: 1000, currency: "USD" }),
      buildPayout({ amount: 2000, currency: "USD" }),
    ];

    render(<PayoutTableView payouts={payouts} />);

    expect(screen.getByText("$10.00")).toBeInTheDocument();
    expect(screen.getByText("$20.00")).toBeInTheDocument();
  });

  it("passes accessibility checks", async () => {
    const payouts = [
      buildPayout({ status: "COMPLETED" }),
      buildPayout({ status: "PENDING", completedAt: null }),
    ];
    const { container } = render(<PayoutTableView payouts={payouts} />);
    await runAxe(container);
  });
});
