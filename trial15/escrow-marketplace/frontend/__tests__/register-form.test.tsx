import { describe, it, expect, vi, beforeEach } from "vitest";
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

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useActionState: (
      _action: Function,
      initialState: { error: string | null }
    ) => {
      return [initialState, (formData: FormData) => {}, false];
    },
  };
});

import RegisterPage from "@/app/(auth)/register/page";

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders registration form with all fields", () => {
    render(<RegisterPage />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/i want to/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  it("renders role select with buyer and seller options", () => {
    render(<RegisterPage />);

    const roleSelect = screen.getByLabelText(/i want to/i);
    expect(roleSelect).toBeInTheDocument();

    const options = roleSelect.querySelectorAll("option");
    const optionValues = Array.from(options).map((opt) => opt.value);
    expect(optionValues).toContain("BUYER");
    expect(optionValues).toContain("SELLER");
  });

  it("has a link to login page", () => {
    render(<RegisterPage />);

    const loginLink = screen.getByRole("link", { name: /sign in/i });
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("has a submit button", () => {
    render(<RegisterPage />);

    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    expect(submitButton).toHaveAttribute("type", "submit");
  });

  it("passes axe accessibility checks", async () => {
    const { container } = render(<RegisterPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
