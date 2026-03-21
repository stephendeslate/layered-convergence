import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

import CreateTransactionPage from "@/app/transactions/create/page";

describe("CreateTransactionPage", () => {
  it("renders all form fields with labels", () => {
    render(<CreateTransactionPage />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/seller id/i)).toBeInTheDocument();
  });

  it("has a submit button", () => {
    render(<CreateTransactionPage />);

    expect(
      screen.getByRole("button", { name: /create transaction/i })
    ).toBeInTheDocument();
  });

  it("title input is required", () => {
    render(<CreateTransactionPage />);

    const titleInput = screen.getByLabelText(/title/i);
    expect(titleInput).toBeRequired();
  });

  it("amount input has number type", () => {
    render(<CreateTransactionPage />);

    const amountInput = screen.getByLabelText(/amount/i);
    expect(amountInput).toHaveAttribute("type", "number");
  });

  it("currency select has USD as default", () => {
    render(<CreateTransactionPage />);

    const currencySelect = screen.getByLabelText(/currency/i);
    expect(currencySelect).toHaveValue("USD");
  });

  it("allows filling in form fields", async () => {
    const user = userEvent.setup();
    render(<CreateTransactionPage />);

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const amountInput = screen.getByLabelText(/amount/i);
    const sellerIdInput = screen.getByLabelText(/seller id/i);

    await user.type(titleInput, "Test Purchase");
    await user.type(descriptionInput, "A test item description");
    await user.type(amountInput, "99.99");
    await user.type(sellerIdInput, "seller-123");

    expect(titleInput).toHaveValue("Test Purchase");
    expect(descriptionInput).toHaveValue("A test item description");
    expect(amountInput).toHaveValue(99.99);
    expect(sellerIdInput).toHaveValue("seller-123");
  });

  it("passes axe accessibility checks", async () => {
    const { container } = render(<CreateTransactionPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
