import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import RegisterPage from "@/app/(auth)/register/page";

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

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the register form with company name, email, and password fields", () => {
    render(<RegisterPage />);

    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  it("allows typing into all form fields", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const companyInput = screen.getByLabelText(/company name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.type(companyInput, "Test Company");
    await user.type(emailInput, "admin@test.com");
    await user.type(passwordInput, "securepass");

    expect(companyInput).toHaveValue("Test Company");
    expect(emailInput).toHaveValue("admin@test.com");
    expect(passwordInput).toHaveValue("securepass");
  });

  it("has a link to the login page", () => {
    render(<RegisterPage />);

    const loginLink = screen.getByRole("link", { name: /sign in/i });
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<RegisterPage />);
    const results = await axe.run(container);
    expect(results).toHaveNoViolations();
  });
});
