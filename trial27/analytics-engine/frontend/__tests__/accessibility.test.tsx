// [TRACED:AE-040] Accessibility tests with real jest-axe imports
import React from "react";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";

expect.extend(toHaveNoViolations);

describe("Accessibility Tests", () => {
  it("Button should have no accessibility violations", async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("Card should have no accessibility violations", async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>Content here</CardContent>
      </Card>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("Form with labels should have no accessibility violations", async () => {
    const { container } = render(
      <form>
        <div>
          <Label htmlFor="test-input">Test Label</Label>
          <Input id="test-input" type="text" />
        </div>
      </form>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("Badge should have no accessibility violations", async () => {
    const { container } = render(<Badge>Status</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
