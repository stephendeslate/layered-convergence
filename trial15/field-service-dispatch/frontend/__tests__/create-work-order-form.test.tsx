import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import NewWorkOrderPage from "@/app/work-orders/new/page";


vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  redirect: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("react-dom", async () => {
  const actual = await vi.importActual("react-dom");
  return {
    ...actual,
    useFormStatus: () => ({ pending: false }),
  };
});

describe("NewWorkOrderPage (Create Work Order Form)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all required form fields with labels", () => {
    render(<NewWorkOrderPage />);

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Priority")).toBeInTheDocument();
    expect(screen.getByLabelText("Customer ID")).toBeInTheDocument();
    expect(screen.getByLabelText("Address")).toBeInTheDocument();
  });

  it("renders optional form fields", () => {
    render(<NewWorkOrderPage />);

    expect(screen.getByLabelText("Scheduled Date")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Estimated Duration (minutes)")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Notes")).toBeInTheDocument();
  });

  it("renders the submit and cancel buttons", () => {
    render(<NewWorkOrderPage />);

    expect(
      screen.getByRole("button", { name: /create work order/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /cancel/i })
    ).toBeInTheDocument();
  });

  it("allows filling out the form", async () => {
    const user = userEvent.setup();
    render(<NewWorkOrderPage />);

    const titleInput = screen.getByLabelText("Title");
    const addressInput = screen.getByLabelText("Address");

    await user.type(titleInput, "HVAC Repair");
    await user.type(addressInput, "123 Main St");

    expect(titleInput).toHaveValue("HVAC Repair");
    expect(addressInput).toHaveValue("123 Main St");
  });

  it("has required attributes on mandatory fields", () => {
    render(<NewWorkOrderPage />);

    expect(screen.getByLabelText("Title")).toBeRequired();
    expect(screen.getByLabelText("Description")).toBeRequired();
    expect(screen.getByLabelText("Priority")).toBeRequired();
    expect(screen.getByLabelText("Customer ID")).toBeRequired();
    expect(screen.getByLabelText("Address")).toBeRequired();
  });

  it("renders a back link to work orders", () => {
    render(<NewWorkOrderPage />);

    const backLinks = screen.getAllByRole("link");
    const workOrdersLink = backLinks.find(
      (link) => link.getAttribute("href") === "/work-orders"
    );
    expect(workOrdersLink).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<NewWorkOrderPage />);
    const results = await axe.run(container);
    expect(results).toHaveNoViolations();
  });
});
