import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { EmbedConfigForm } from "@/components/embeds/embed-config-form";
import type { Dashboard } from "@/lib/types";

expect.extend(toHaveNoViolations);

const dashboards: Dashboard[] = [
  {
    id: "dash-1",
    name: "Sales Overview",
    description: "Sales metrics dashboard",
    widgets: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "dash-2",
    name: "Engineering Metrics",
    description: "Engineering performance dashboard",
    widgets: [],
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-15T00:00:00Z",
  },
];

describe("EmbedConfigForm", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  it("renders the form with dashboard select and origins input", () => {
    render(<EmbedConfigForm dashboards={dashboards} onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/allowed origins/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expires at/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create embed/i })).toBeInTheDocument();
  });

  it("lists dashboard options in the select", () => {
    render(<EmbedConfigForm dashboards={dashboards} onSubmit={mockOnSubmit} />);

    const select = screen.getByLabelText(/dashboard/i);
    expect(select).toBeInTheDocument();

    const options = select.querySelectorAll("option");
    const optionTexts = Array.from(options).map((o) => o.textContent);
    expect(optionTexts).toContain("Sales Overview");
    expect(optionTexts).toContain("Engineering Metrics");
  });

  it("submits the form with correct payload", async () => {
    const user = userEvent.setup();
    render(<EmbedConfigForm dashboards={dashboards} onSubmit={mockOnSubmit} />);

    await user.selectOptions(screen.getByLabelText(/dashboard/i), "dash-1");
    await user.type(
      screen.getByLabelText(/allowed origins/i),
      "https://app.example.com, https://other.example.com"
    );
    await user.click(screen.getByRole("button", { name: /create embed/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        dashboardId: "dash-1",
        allowedOrigins: ["https://app.example.com", "https://other.example.com"],
      });
    });
  });

  it("shows an error when submission fails", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValueOnce(new Error("Network error"));

    render(<EmbedConfigForm dashboards={dashboards} onSubmit={mockOnSubmit} />);

    await user.selectOptions(screen.getByLabelText(/dashboard/i), "dash-1");
    await user.type(screen.getByLabelText(/allowed origins/i), "https://example.com");
    await user.click(screen.getByRole("button", { name: /create embed/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Network error");
    });
  });

  it("resets form after successful submission", async () => {
    const user = userEvent.setup();
    render(<EmbedConfigForm dashboards={dashboards} onSubmit={mockOnSubmit} />);

    await user.selectOptions(screen.getByLabelText(/dashboard/i), "dash-1");
    await user.type(screen.getByLabelText(/allowed origins/i), "https://example.com");
    await user.click(screen.getByRole("button", { name: /create embed/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    expect(screen.getByLabelText(/allowed origins/i)).toHaveValue("");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <EmbedConfigForm dashboards={dashboards} onSubmit={mockOnSubmit} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
