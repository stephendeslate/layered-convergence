import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Badge } from "@/components/ui/badge";

expect.extend(toHaveNoViolations);

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders with default variant", () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.querySelector("span");
    expect(badge).toHaveClass("bg-primary");
  });

  it("renders with success variant", () => {
    const { container } = render(<Badge variant="success">Connected</Badge>);
    const badge = container.querySelector("span");
    expect(badge).toHaveClass("bg-green-600");
  });

  it("renders with warning variant", () => {
    const { container } = render(<Badge variant="warning">Syncing</Badge>);
    const badge = container.querySelector("span");
    expect(badge).toHaveClass("bg-yellow-500");
  });

  it("renders with destructive variant", () => {
    const { container } = render(<Badge variant="destructive">Error</Badge>);
    const badge = container.querySelector("span");
    expect(badge).toHaveClass("bg-destructive");
  });

  it("renders with secondary variant", () => {
    const { container } = render(<Badge variant="secondary">Info</Badge>);
    const badge = container.querySelector("span");
    expect(badge).toHaveClass("bg-secondary");
  });

  it("applies custom className", () => {
    const { container } = render(
      <Badge className="custom-class">Custom</Badge>
    );
    const badge = container.querySelector("span");
    expect(badge).toHaveClass("custom-class");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <div>
        <Badge>Default</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="destructive">Error</Badge>
        <Badge variant="secondary">Secondary</Badge>
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
