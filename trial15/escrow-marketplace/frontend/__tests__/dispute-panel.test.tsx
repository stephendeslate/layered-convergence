import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DisputePanel } from "@/components/disputes/dispute-panel";
import { runAxe } from "./helpers";

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useActionState: (
      _action: Function,
      initialState: { error: string | null; success: boolean }
    ) => {
      return [initialState, (formData: FormData) => {}, false];
    },
  };
});

const mockSubmitAction = vi.fn().mockResolvedValue({
  error: null,
  success: false,
});

describe("DisputePanel", () => {
  it("renders the dispute form with reason and evidence fields", () => {
    render(
      <DisputePanel
        transactionId="tx-123"
        submitAction={mockSubmitAction}
      />
    );

    expect(screen.getByLabelText(/reason for dispute/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/evidence/i)).toBeInTheDocument();
  });

  it("has a submit button", () => {
    render(
      <DisputePanel
        transactionId="tx-123"
        submitAction={mockSubmitAction}
      />
    );

    expect(
      screen.getByRole("button", { name: /file dispute/i })
    ).toBeInTheDocument();
  });

  it("reason field is required", () => {
    render(
      <DisputePanel
        transactionId="tx-123"
        submitAction={mockSubmitAction}
      />
    );

    const reasonInput = screen.getByLabelText(/reason for dispute/i);
    expect(reasonInput).toBeRequired();
  });

  it("evidence field is required", () => {
    render(
      <DisputePanel
        transactionId="tx-123"
        submitAction={mockSubmitAction}
      />
    );

    const evidenceInput = screen.getByLabelText(/evidence/i);
    expect(evidenceInput).toBeRequired();
  });

  it("renders the card title", () => {
    render(
      <DisputePanel
        transactionId="tx-123"
        submitAction={mockSubmitAction}
      />
    );

    expect(screen.getByText("File a Dispute")).toBeInTheDocument();
  });

  it("passes accessibility checks", async () => {
    const { container } = render(
      <DisputePanel
        transactionId="tx-123"
        submitAction={mockSubmitAction}
      />
    );
    await runAxe(container);
  });
});
