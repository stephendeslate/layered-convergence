import type { Transaction, Dispute, Payout, User, TransactionStatus } from "@/lib/types";

let idCounter = 0;

function nextId(): string {
  idCounter += 1;
  return `test-id-${idCounter}`;
}

export function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: nextId(),
    email: "test@example.com",
    name: "Test User",
    role: "BUYER",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
    ...overrides,
  };
}

export function buildTransaction(
  overrides: Partial<Transaction> = {}
): Transaction {
  const buyer = buildUser({ name: "Alice Buyer", role: "BUYER" });
  const seller = buildUser({ name: "Bob Seller", role: "SELLER" });
  return {
    id: nextId(),
    title: "Test Widget Purchase",
    description: "A high-quality widget for testing purposes",
    amount: 5000,
    currency: "USD",
    status: "PENDING" as TransactionStatus,
    buyerId: buyer.id,
    sellerId: seller.id,
    buyer,
    seller,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
    fundedAt: null,
    shippedAt: null,
    deliveredAt: null,
    releasedAt: null,
    cancelledAt: null,
    disputedAt: null,
    resolvedAt: null,
    ...overrides,
  };
}

export function buildDispute(overrides: Partial<Dispute> = {}): Dispute {
  const transaction = buildTransaction({ status: "DISPUTED" });
  const filedByUser = buildUser({ name: "Alice Buyer" });
  return {
    id: nextId(),
    transactionId: transaction.id,
    transaction,
    reason: "Item not as described",
    evidence: "The item received differs significantly from the listing description and photos.",
    resolution: null,
    status: "OPEN",
    filedBy: filedByUser.id,
    filedByUser,
    createdAt: "2025-01-16T10:00:00Z",
    updatedAt: "2025-01-16T10:00:00Z",
    resolvedAt: null,
    ...overrides,
  };
}

export function buildPayout(overrides: Partial<Payout> = {}): Payout {
  return {
    id: nextId(),
    userId: nextId(),
    amount: 4500,
    currency: "USD",
    status: "COMPLETED",
    stripePayoutId: "po_test_123",
    createdAt: "2025-01-20T10:00:00Z",
    completedAt: "2025-01-21T10:00:00Z",
    ...overrides,
  };
}

export async function runAxe(container: HTMLElement): Promise<void> {
  const axeCore = await import("axe-core");
  const axe = axeCore.default;
  const results = await axe.run(container);
  const violations = results.violations;
  if (violations.length > 0) {
    const message = violations
      .map(
        (v) =>
          `${v.id}: ${v.description}\n  ${v.nodes.map((n) => n.html).join("\n  ")}`
      )
      .join("\n\n");
    throw new Error(`Accessibility violations:\n${message}`);
  }
}
