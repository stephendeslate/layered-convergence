import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import type { Dispute } from "@/lib/types";

expect.extend(toHaveNoViolations);

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

import { DisputeCard } from "@/components/disputes/dispute-card";

const mockDispute: Dispute = {
  id: "dispute-1",
  transactionId: "tx-123",
  transaction: {
    id: "tx-123",
    title: "Widget Purchase",
    description: "Dispute over widget quality",
    amount: 5000,
    currency: "USD",
    status: "DISPUTED",
    buyerId: "user-1",
    sellerId: "user-2",
    buyer: {
      id: "user-1",
      email: "buyer@test.com",
      name: "Alice",
      role: "BUYER",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    seller: {
      id: "user-2",
      email: "seller@test.com",
      name: "Bob",
      role: "SELLER",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    createdAt: "2024-06-15T10:00:00Z",
    updatedAt: "2024-06-15T10:00:00Z",
    fundedAt: "2024-06-16T10:00:00Z",
    shippedAt: null,
    deliveredAt: null,
    releasedAt: null,
    cancelledAt: null,
    disputedAt: "2024-06-17T10:00:00Z",
    resolvedAt: null,
  },
  reason: "Item received was not as described",
  evidence: "Photos showing defects in the widget",
  resolution: null,
  status: "OPEN",
  filedBy: "user-1",
  filedByUser: {
    id: "user-1",
    email: "buyer@test.com",
    name: "Alice Buyer",
    role: "BUYER",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  createdAt: "2024-06-17T12:00:00Z",
  updatedAt: "2024-06-17T12:00:00Z",
  resolvedAt: null,
};

describe("DisputeCard", () => {
  it("renders dispute reason", () => {
    render(<DisputeCard dispute={mockDispute} />);
    expect(
      screen.getByText("Item received was not as described")
    ).toBeInTheDocument();
  });

  it("renders dispute status badge", () => {
    render(<DisputeCard dispute={mockDispute} />);
    expect(screen.getByText("OPEN")).toBeInTheDocument();
  });

  it("renders transaction title", () => {
    render(<DisputeCard dispute={mockDispute} />);
    expect(
      screen.getByText(/Dispute for:.*Widget Purchase/)
    ).toBeInTheDocument();
  });

  it("renders filed by user name", () => {
    render(<DisputeCard dispute={mockDispute} />);
    expect(screen.getByText(/Alice Buyer/)).toBeInTheDocument();
  });

  it("links to dispute detail page", () => {
    render(<DisputeCard dispute={mockDispute} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/disputes/dispute-1");
  });

  it("renders resolved date when available", () => {
    const resolvedDispute: Dispute = {
      ...mockDispute,
      status: "RESOLVED",
      resolution: "Item was replaced",
      resolvedAt: "2024-06-20T10:00:00Z",
    };
    render(<DisputeCard dispute={resolvedDispute} />);
    expect(screen.getByText(/Resolved:/)).toBeInTheDocument();
  });

  it("passes axe accessibility checks", async () => {
    const { container } = render(<DisputeCard dispute={mockDispute} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
