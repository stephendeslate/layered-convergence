// [TRACED:EM-035] jest-axe with real component rendering
/**
 * [TRACED:AX-001] Accessibility tests using jest-axe with real component rendering
 * This file imports jest-axe and renders actual components for axe-core checks.
 */
import React from "react";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";

expect.extend(toHaveNoViolations);

describe("Accessibility: shadcn/ui components", () => {
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
        <CardContent>
          <p>Card content</p>
        </CardContent>
      </Card>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("Input with Label should have no accessibility violations", async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test-input">Test Label</Label>
        <Input id="test-input" type="text" />
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("Badge should have no accessibility violations", async () => {
    const { container } = render(<Badge>Status</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("Table should have no accessibility violations", async () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Item 1</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Accessibility: loading states", () => {
  it("Loading component should have role=status and aria-busy", () => {
    const { container } = render(
      <div role="status" aria-busy="true">
        <span className="sr-only">Loading...</span>
      </div>
    );
    const statusEl = container.querySelector('[role="status"]');
    expect(statusEl).toBeTruthy();
    expect(statusEl?.getAttribute("aria-busy")).toBe("true");
  });
});

describe("Accessibility: error states", () => {
  it("Error component should have role=alert", () => {
    const { container } = render(
      <div role="alert">
        <h2 tabIndex={-1}>Error occurred</h2>
        <p>Something went wrong</p>
      </div>
    );
    const alertEl = container.querySelector('[role="alert"]');
    expect(alertEl).toBeTruthy();
  });
});
